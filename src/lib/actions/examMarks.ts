"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireTeacherForExam(examId: string) {
  const session = await auth();
  if (session?.user.role !== "TEACHER" && session?.user.role !== "PRINCIPAL") {
    throw new Error("Unauthorized");
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
  });
  if (!staff) throw new Error("Unauthorized");

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) throw new Error("Unauthorized");

  const klass = await prisma.class.findUnique({ where: { id: exam.classId } });
  if (!klass || klass.teacherId !== staff.id) {
    throw new Error("Unauthorized: not your class");
  }

  return { staff, exam };
}

export async function saveExamMarks(examId: string, formData: FormData) {
  const { staff, exam } = await requireTeacherForExam(examId);

  const examSubjects = await prisma.examSubject.findMany({
    where: { examId },
  });
  const students = await prisma.student.findMany({
    where: { classId: exam.classId },
    select: { id: true },
  });

  const writes: Promise<unknown>[] = [];

  for (const es of examSubjects) {
    for (const { id: studentId } of students) {
      const raw = formData.get(`marks_${es.id}_${studentId}`);
      if (raw === null || raw === "") continue;
      const marksObtained = Number(raw);
      if (!Number.isFinite(marksObtained) || marksObtained < 0) continue;
      const capped = Math.min(marksObtained, es.maxMarks);

      writes.push(
        prisma.examMark.upsert({
          where: { examSubjectId_studentId: { examSubjectId: es.id, studentId } },
          create: {
            examSubjectId: es.id,
            studentId,
            marksObtained: capped,
            enteredById: staff.id,
          },
          update: { marksObtained: capped, enteredById: staff.id },
        }),
      );
    }
  }

  await Promise.all(writes);
  revalidatePath(`/portal/classes/${exam.classId}/exams/${examId}`);
}
