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

function readClassForm(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const teacherId = (formData.get("teacherId") as string) || null;
  const sectionId = (formData.get("sectionId") as string) || null;
  return { name, teacherId, sectionId };
}

export async function createClass(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { name, teacherId, sectionId } = readClassForm(formData);
  if (!name) return { error: "Class name is required." };

  try {
    await prisma.class.create({ data: { name, teacherId, sectionId } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `A class named "${name}" already exists.` };
    }
    throw err;
  }

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}

export async function updateClass(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { name, teacherId, sectionId } = readClassForm(formData);
  if (!name) return { error: "Class name is required." };

  try {
    await prisma.class.update({
      where: { id },
      data: { name, teacherId, sectionId },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `A class named "${name}" already exists.` };
    }
    throw err;
  }

  revalidatePath("/admin/classes");
  redirect("/admin/classes");
}
