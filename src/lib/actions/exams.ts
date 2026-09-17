"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

export async function createExam(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.exams");

  const name = (formData.get("name") as string)?.trim();
  const term = (formData.get("term") as string)?.trim();
  const classId = formData.get("classId") as string;
  const examDate = formData.get("examDate") as string;

  if (!name) return { error: "Name is required." };
  if (!term) return { error: "Term is required." };
  if (!classId) return { error: "Class is required." };

  const exam = await prisma.exam.create({
    data: {
      name,
      term,
      classId,
      examDate: examDate ? new Date(examDate) : null,
    },
  });

  revalidatePath("/admin/exams");
  redirect(`/admin/exams/${exam.id}`);
}

export async function deleteExam(id: string) {
  await requirePermission("admin.exams");
  await prisma.exam.delete({ where: { id } });
  revalidatePath("/admin/exams");
  redirect("/admin/exams");
}

export async function togglePublishExam(id: string, published: boolean) {
  await requirePermission("admin.exams");
  await prisma.exam.update({ where: { id }, data: { published } });
  revalidatePath(`/admin/exams/${id}`);
  revalidatePath("/admin/exams");
}

export async function addExamSubject(
  examId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.exams");

  const subjectId = formData.get("subjectId") as string;
  const maxMarks = Number(formData.get("maxMarks"));

  if (!subjectId) return { error: "Subject is required." };
  if (!Number.isFinite(maxMarks) || maxMarks <= 0) {
    return { error: "Max marks must be a positive number." };
  }

  await prisma.examSubject.create({ data: { examId, subjectId, maxMarks } });

  revalidatePath(`/admin/exams/${examId}`);
  return {};
}

export async function removeExamSubject(examSubjectId: string, examId: string) {
  await requirePermission("admin.exams");
  await prisma.examSubject.delete({ where: { id: examSubjectId } });
  revalidatePath(`/admin/exams/${examId}`);
}
