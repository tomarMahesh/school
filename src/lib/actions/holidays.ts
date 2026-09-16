"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

export async function createHoliday(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.holidays");

  const name = (formData.get("name") as string)?.trim();
  const date = formData.get("date") as string;

  if (!name) return { error: "Name is required." };
  if (!date) return { error: "Date is required." };

  await prisma.holiday.create({ data: { name, date: new Date(date) } });

  revalidatePath("/admin/holidays");
  return {};
}

export async function deleteHoliday(id: string) {
  await requirePermission("admin.holidays");
  await prisma.holiday.delete({ where: { id } });
  revalidatePath("/admin/holidays");
}
