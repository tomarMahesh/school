"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

async function requireTeacherForStudent(studentId: string) {
  const session = await auth();
  if (session?.user.role !== "TEACHER" && session?.user.role !== "PRINCIPAL") {
    throw new Error("Unauthorized");
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
  });
  if (!staff) throw new Error("Unauthorized");

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { class: true },
  });
  if (!student || student.class?.teacherId !== staff.id) {
    throw new Error("Unauthorized: not your student");
  }

  return staff;
}

export async function addGrade(
  studentId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const staff = await requireTeacherForStudent(studentId);

  const subjectId = formData.get("subjectId") as string;
  const term = (formData.get("term") as string)?.trim();
  const score = Number(formData.get("score"));
  const maxScore = Number(formData.get("maxScore"));

  if (!subjectId) return { error: "Subject is required." };
  if (!term) return { error: "Term is required." };
  if (!Number.isFinite(score) || score < 0) {
    return { error: "Score must be a non-negative number." };
  }
  if (!Number.isFinite(maxScore) || maxScore <= 0) {
    return { error: "Max score must be a positive number." };
  }
  if (score > maxScore) {
    return { error: "Score cannot exceed max score." };
  }

  await prisma.grade.create({
    data: {
      studentId,
      subjectId,
      term,
      score,
      maxScore,
      givenById: staff.id,
    },
  });

  revalidatePath(`/portal/classes`);
  return {};
}

export async function deleteGrade(gradeId: string, studentId: string) {
  await requireTeacherForStudent(studentId);
  await prisma.grade.delete({ where: { id: gradeId } });
  revalidatePath(`/portal/classes`);
}
