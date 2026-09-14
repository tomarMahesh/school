"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireTeacherForClass(classId: string) {
  const session = await auth();
  if (session?.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });
  if (!teacher) throw new Error("Unauthorized");

  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass || klass.teacherId !== teacher.id) {
    throw new Error("Unauthorized: not your class");
  }

  return teacher;
}

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE"];

export async function markAttendance(
  classId: string,
  date: string,
  formData: FormData,
) {
  const teacher = await requireTeacherForClass(classId);

  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date");
  }

  await prisma.$transaction(
    students.map(({ id: studentId }) => {
      const status = formData.get(`status_${studentId}`) as string;
      const safeStatus = VALID_STATUSES.includes(status) ? status : "PRESENT";

      return prisma.attendance.upsert({
        where: { studentId_date: { studentId, date: parsedDate } },
        create: {
          studentId,
          classId,
          date: parsedDate,
          status: safeStatus,
          markedById: teacher.id,
        },
        update: {
          status: safeStatus,
          markedById: teacher.id,
        },
      });
    }),
  );

  revalidatePath(`/portal/classes/${classId}/attendance`);
}
