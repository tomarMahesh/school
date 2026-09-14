"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function createStudent(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const classId = (formData.get("classId") as string) || null;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role: "STUDENT",
        passwordHash,
        student: { create: { classId } },
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `A user with email "${email}" already exists.` };
    }
    throw err;
  }

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function updateStudent(
  studentId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const classId = (formData.get("classId") as string) || null;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (password && password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) return { error: "Student not found." };

  try {
    await prisma.user.update({
      where: { id: student.userId },
      data: {
        name,
        email,
        ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}),
      },
    });
    await prisma.student.update({
      where: { id: studentId },
      data: { classId },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `A user with email "${email}" already exists.` };
    }
    throw err;
  }

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) return;
  await prisma.user.delete({ where: { id: student.userId } });
  revalidatePath("/admin/students");
}
