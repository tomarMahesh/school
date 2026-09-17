"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

export async function setFeeStructure(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.fees");

  const classId = formData.get("classId") as string;
  const term = (formData.get("term") as string)?.trim();
  const amount = Number(formData.get("amount"));

  if (!classId) return { error: "Class is required." };
  if (!term) return { error: "Term is required." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  await prisma.feeStructure.upsert({
    where: { classId_term: { classId, term } },
    update: { amount },
    create: { classId, term, amount },
  });

  revalidatePath("/admin/fees");
  return {};
}

export async function deleteFeeStructure(id: string) {
  await requirePermission("admin.fees");
  await prisma.feeStructure.delete({ where: { id } });
  revalidatePath("/admin/fees");
}

export async function recordPayment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requirePermission("admin.fees");

  const studentId = formData.get("studentId") as string;
  const term = (formData.get("term") as string)?.trim();
  const amount = Number(formData.get("amount"));
  const method = (formData.get("method") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;

  if (!studentId) return { error: "Student is required." };
  if (!term) return { error: "Term is required." };
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  await prisma.feePayment.create({
    data: {
      studentId,
      term,
      amount,
      method,
      note,
      recordedById: session.user.id,
    },
  });

  revalidatePath("/admin/fees");
  return {};
}

export async function deletePayment(id: string) {
  await requirePermission("admin.fees");
  await prisma.feePayment.delete({ where: { id } });
  revalidatePath("/admin/fees");
}
