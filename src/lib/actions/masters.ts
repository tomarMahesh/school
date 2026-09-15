"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

function duplicateError(err: unknown, label: string): ActionState | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return { error: `A ${label} with that name already exists.` };
  }
  return null;
}

// --- Subjects ---

export async function createSubject(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const code = (formData.get("code") as string)?.trim() || null;
  if (!name) return { error: "Name is required." };

  try {
    await prisma.subject.create({ data: { name, code } });
  } catch (err) {
    const dup = duplicateError(err, "subject");
    if (dup) return dup;
    throw err;
  }

  revalidatePath("/admin/subjects");
  redirect("/admin/subjects");
}

export async function deleteSubject(id: string) {
  await requireAdmin();
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin/subjects");
}

// --- Sections ---

export async function createSection(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  try {
    await prisma.section.create({ data: { name } });
  } catch (err) {
    const dup = duplicateError(err, "section");
    if (dup) return dup;
    throw err;
  }

  revalidatePath("/admin/sections");
  redirect("/admin/sections");
}

export async function deleteSection(id: string) {
  await requireAdmin();
  await prisma.section.delete({ where: { id } });
  revalidatePath("/admin/sections");
}

// --- Academic Years ---

export async function createAcademicYear(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;

  if (!name) return { error: "Name is required." };
  if (!startDate || !endDate) return { error: "Start and end dates are required." };
  if (new Date(startDate) >= new Date(endDate)) {
    return { error: "Start date must be before end date." };
  }

  try {
    await prisma.academicYear.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) },
    });
  } catch (err) {
    const dup = duplicateError(err, "academic year");
    if (dup) return dup;
    throw err;
  }

  revalidatePath("/admin/academic-years");
  redirect("/admin/academic-years");
}

export async function setCurrentAcademicYear(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.academicYear.updateMany({ data: { isCurrent: false }, where: {} }),
    prisma.academicYear.update({ where: { id }, data: { isCurrent: true } }),
  ]);
  revalidatePath("/admin/academic-years");
}

export async function deleteAcademicYear(id: string) {
  await requireAdmin();
  await prisma.academicYear.delete({ where: { id } });
  revalidatePath("/admin/academic-years");
}
