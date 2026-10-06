"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { errorFields, logger } from "@/lib/logger";
import { sendPasswordSetupEmail } from "@/lib/passwordSetup";
import { encryptField, hashField } from "@/lib/fieldCrypto";

type ActionState = { error?: string };

const STAFF_ROLES: Role[] = ["TEACHER", "PRINCIPAL", "STAFF"];

/** A random, never-stored-in-plaintext password for a brand-new account --
 * it's unusable until the user sets their own via the emailed setup link. */
async function unusablePasswordHash() {
  return bcrypt.hash(randomBytes(32).toString("hex"), 10);
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

function readStaffForm(formData: FormData) {
  return {
    name: (formData.get("name") as string)?.trim(),
    email: (formData.get("email") as string)?.trim().toLowerCase(),
    role: formData.get("role") as Role,
    designation: (formData.get("designation") as string)?.trim(),
    qualification: (formData.get("qualification") as string)?.trim() || null,
    education: (formData.get("education") as string)?.trim() || null,
    aadharNumber: (formData.get("aadharNumber") as string)?.trim() || null,
    subjectIds: formData.getAll("subjectIds") as string[],
    phone: (formData.get("phone") as string)?.trim() || null,
    address: (formData.get("address") as string)?.trim() || null,
  };
}

// The MariaDB driver adapter reports the violated index under
// meta.driverAdapterError rather than meta.target.
function violatedIndex(err: Prisma.PrismaClientKnownRequestError): string {
  const meta = err.meta as
    | {
        target?: string[];
        driverAdapterError?: { cause?: { constraint?: { index?: string } } };
      }
    | undefined;
  return (
    meta?.target?.join(", ") ??
    meta?.driverAdapterError?.cause?.constraint?.index ??
    ""
  ).toLowerCase();
}

function aadharColumns(aadhar: string | null) {
  return aadhar
    ? { aadharNumber: encryptField(aadhar), aadharHash: hashField(aadhar) }
    : { aadharNumber: null, aadharHash: null };
}

function validateStaffForm(fields: ReturnType<typeof readStaffForm>): string | null {
  if (!fields.name) return "Name is required.";
  if (!fields.email) return "Email is required.";
  if (!STAFF_ROLES.includes(fields.role)) return "Invalid role.";
  if (!fields.designation) return "Designation is required.";
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
  const error = validateStaffForm(fields);
  if (error) return { error };

  let staffUserId: string;

  try {
    const user = await prisma.user.create({
      data: {
        name: fields.name,
        email: fields.email,
        role: fields.role,
        passwordHash: await unusablePasswordHash(),
        staff: {
          create: {
            designation: fields.designation,
            qualification: fields.qualification,
            education: fields.education,
            ...aadharColumns(fields.aadharNumber),
            subjects: { connect: fields.subjectIds.map((id) => ({ id })) },
            phone: fields.phone,
            address: fields.address,
          },
        },
      },
    });
    staffUserId = user.id;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = violatedIndex(err);
      return {
        error: target.includes("aadhar")
          ? "This Aadhar number is already registered to another staff member."
          : `A user with email "${fields.email}" already exists.`,
      };
    }
    throw err;
  }

  revalidatePath("/admin/staff");

  let emailStatus: "sent" | "failed" = "sent";
  try {
    await sendPasswordSetupEmail({
      userId: staffUserId,
      name: fields.name,
      email: fields.email,
      role: fields.role,
    });
  } catch (err) {
    logger.error("setup_email_failed", { email: fields.email, ...errorFields(err) });
    emailStatus = "failed";
  }

  redirect(`/admin/staff?emailStatus=${emailStatus}&name=${encodeURIComponent(fields.name)}`);
}

export async function updateStaff(
  staffId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const fields = readStaffForm(formData);
  const error = validateStaffForm(fields);
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
      },
    });
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        designation: fields.designation,
        qualification: fields.qualification,
        education: fields.education,
        ...aadharColumns(fields.aadharNumber),
        subjects: { set: fields.subjectIds.map((id) => ({ id })) },
        phone: fields.phone,
        address: fields.address,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = violatedIndex(err);
      return {
        error: target.includes("aadhar")
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
