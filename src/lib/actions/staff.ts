"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

const STAFF_ROLES: Role[] = ["TEACHER", "PRINCIPAL", "STAFF"];

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

function readStaffForm(formData: FormData) {
  return {
    name: (formData.get("name") as string)?.trim(),
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    password: formData.get("password") as string,
    role: formData.get("role") as Role,
    designation: (formData.get("designation") as string)?.trim(),
    qualification: (formData.get("qualification") as string)?.trim() || null,
    education: (formData.get("education") as string)?.trim() || null,
    aadharNumber: (formData.get("aadharNumber") as string)?.trim() || null,
    subjects: (formData.get("subjects") as string)?.trim() || null,
    phone: (formData.get("phone") as string)?.trim() || null,
    address: (formData.get("address") as string)?.trim() || null,
  };
}

function validateStaffForm(
  fields: ReturnType<typeof readStaffForm>,
  { requirePassword }: { requirePassword: boolean },
): string | null {
  if (!fields.name) return "Name is required.";
  if (!fields.email) return "Email is required.";
  if (!STAFF_ROLES.includes(fields.role)) return "Invalid role.";
  if (!fields.designation) return "Designation is required.";
  if (requirePassword && (!fields.password || fields.password.length < 8)) {
    return "Password must be at least 8 characters.";
  }
  if (fields.password && fields.password.length > 0 && fields.password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (fields.aadharNumber && !/^\d{12}$/.test(fields.aadharNumber)) {
    return "Aadhar number must be exactly 12 digits.";
  }
  return null;
}

export async function createStaff(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const fields = readStaffForm(formData);
  const error = validateStaffForm(fields, { requirePassword: true });
  if (error) return { error };

  const passwordHash = await bcrypt.hash(fields.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: fields.name,
        email: fields.email,
        role: fields.role,
        passwordHash,
        staff: {
          create: {
            designation: fields.designation,
            qualification: fields.qualification,
            education: fields.education,
            aadharNumber: fields.aadharNumber,
            subjects: fields.subjects,
            phone: fields.phone,
            address: fields.address,
          },
        },
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      return {
        error: target?.includes("aadhar")
          ? "This Aadhar number is already registered to another staff member."
          : `A user with email "${fields.email}" already exists.`,
      };
    }
    throw err;
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function updateStaff(
  staffId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const fields = readStaffForm(formData);
  const error = validateStaffForm(fields, { requirePassword: false });
  if (error) return { error };

  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return { error: "Staff member not found." };

  try {
    await prisma.user.update({
      where: { id: staff.userId },
      data: {
        name: fields.name,
        email: fields.email,
        role: fields.role,
        ...(fields.password
          ? { passwordHash: await bcrypt.hash(fields.password, 10) }
          : {}),
      },
    });
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        designation: fields.designation,
        qualification: fields.qualification,
        education: fields.education,
        aadharNumber: fields.aadharNumber,
        subjects: fields.subjects,
        phone: fields.phone,
        address: fields.address,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ");
      return {
        error: target?.includes("aadhar")
          ? "This Aadhar number is already registered to another staff member."
          : `A user with email "${fields.email}" already exists.`,
      };
    }
    throw err;
  }

  revalidatePath("/admin/staff");
  redirect("/admin/staff");
}

export async function deleteStaff(staffId: string) {
  await requireAdmin();
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });
  if (!staff) return;
  await prisma.user.delete({ where: { id: staff.userId } });
  revalidatePath("/admin/staff");
}
