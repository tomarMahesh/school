"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";

type ActionState = { error?: string };

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

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
  if (examDate && examDate < todayIso()) {
    return { error: "Exam date cannot be in the past." };
  }

  // An exam always belongs to the class's own academic year -- but we
  // only ever let admins schedule against the *current* year, so this
  // also guards against a stale/tampered classId from an old session.
  const currentYear = await getCurrentAcademicYear();
  if (!currentYear) {
    return { error: "Set a current academic year before scheduling exams." };
  }
  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass || klass.academicYearId !== currentYear.id) {
    return { error: "Selected class does not belong to the current academic year." };
  }

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
