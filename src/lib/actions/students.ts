"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomInt, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import { Prisma } from "@/generated/prisma/client";
import type { Gender } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordSetupEmail } from "@/lib/passwordSetup";

/** A random, never-stored-in-plaintext password for a brand-new account --
 * it's unusable until the user sets their own via the emailed setup link. */
async function unusablePasswordHash() {
  return bcrypt.hash(randomBytes(32).toString("hex"), 10);
}

type ActionState = { error?: string };

const GENDERS: Gender[] = ["MALE", "FEMALE", "OTHER"];

function readGender(formData: FormData): Gender | null {
  const value = formData.get("gender") as string;
  return GENDERS.includes(value as Gender) ? (value as Gender) : null;
}

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
  const classId = (formData.get("classId") as string) || null;
  const streamId = (formData.get("streamId") as string) || null;
  const subjectIds = formData.getAll("subjectIds") as string[];
  const fatherName = (formData.get("fatherName") as string)?.trim() || null;
  const motherName = (formData.get("motherName") as string)?.trim() || null;
  const gender = readGender(formData);
  const address = (formData.get("address") as string)?.trim() || null;
  const stateId = (formData.get("stateId") as string) || null;
  const districtId = (formData.get("districtId") as string) || null;
  const pincodeId = (formData.get("pincodeId") as string) || null;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  let studentUserId: string;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "STUDENT",
        passwordHash: await unusablePasswordHash(),
        student: {
          create: {
            classId,
            streamId,
            fatherName,
            motherName,
            gender,
            address,
            stateId,
            districtId,
            pincodeId,
            subjects: { connect: subjectIds.map((id) => ({ id })) },
          },
        },
      },
    });
    studentUserId = user.id;
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

  let emailStatus: "sent" | "failed" = "sent";
  try {
    await sendPasswordSetupEmail({ userId: studentUserId, name, email, role: "STUDENT" });
  } catch {
    emailStatus = "failed";
  }

  redirect(`/admin/students?emailStatus=${emailStatus}&name=${encodeURIComponent(name)}`);
}

export async function updateStudent(
  studentId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const classId = (formData.get("classId") as string) || null;
  const streamId = (formData.get("streamId") as string) || null;
  const subjectIds = formData.getAll("subjectIds") as string[];
  const fatherName = (formData.get("fatherName") as string)?.trim() || null;
  const motherName = (formData.get("motherName") as string)?.trim() || null;
  const gender = readGender(formData);
  const address = (formData.get("address") as string)?.trim() || null;
  const stateId = (formData.get("stateId") as string) || null;
  const districtId = (formData.get("districtId") as string) || null;
  const pincodeId = (formData.get("pincodeId") as string) || null;

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) return { error: "Student not found." };

  try {
    await prisma.user.update({
      where: { id: student.userId },
      data: { name, email },
    });
    await prisma.student.update({
      where: { id: studentId },
      data: {
        classId,
        streamId,
        fatherName,
        gender,
        motherName,
        address,
        stateId,
        districtId,
        pincodeId,
        subjects: { set: subjectIds.map((id) => ({ id })) },
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

export type ImportRowResult = {
  row: number;
  name: string;
  email: string;
  status: "created" | "skipped";
  password?: string;
  message?: string;
};

export type ImportActionState = { error?: string; results?: ImportRowResult[] };

const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function randomPassword(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[randomInt(PASSWORD_CHARS.length)];
  }
  return out;
}

export async function importStudents(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  await requireAdmin();

  const academicYearId = formData.get("academicYearId") as string;
  if (!academicYearId) return { error: "Please select an academic year." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose an Excel file to upload." };
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    return { error: "Could not read that file. Please upload a valid .xlsx file." };
  }

  const sheet = workbook.worksheets[0];
  if (!sheet) return { error: "The workbook has no sheets." };

  const columnOf: Record<string, number> = {};
  sheet.getRow(1).eachCell((cell, colNumber) => {
    const key = String(cell.value ?? "").trim().toLowerCase();
    if (key) columnOf[key] = colNumber;
  });

  const nameCol = columnOf["name"];
  const emailCol = columnOf["email"];
  const classCol = columnOf["class"];
  const passwordCol = columnOf["password"];

  if (!nameCol || !emailCol || !classCol) {
    return {
      error: 'The sheet must have "Name", "Email", and "Class" column headers in row 1.',
    };
  }

  const classes = await prisma.class.findMany({ where: { academicYearId } });
  const classByName = new Map(classes.map((c) => [c.name.toLowerCase(), c]));

  const results: ImportRowResult[] = [];

  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const name = String(row.getCell(nameCol).value ?? "").trim();
    const email = String(row.getCell(emailCol).value ?? "").trim().toLowerCase();
    const className = String(row.getCell(classCol).value ?? "").trim();
    const rawPassword = passwordCol
      ? String(row.getCell(passwordCol).value ?? "").trim()
      : "";

    if (!name && !email && !className) continue; // blank row

    if (!name || !email) {
      results.push({
        row: rowNumber,
        name,
        email,
        status: "skipped",
        message: "Missing name or email.",
      });
      continue;
    }

    const klass = classByName.get(className.toLowerCase());
    if (!klass) {
      results.push({
        row: rowNumber,
        name,
        email,
        status: "skipped",
        message: `Class "${className}" not found in that academic year.`,
      });
      continue;
    }

    const password = rawPassword.length >= 8 ? rawPassword : randomPassword();

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          name,
          email,
          role: "STUDENT",
          passwordHash,
          student: { create: { classId: klass.id } },
        },
      });
      results.push({ row: rowNumber, name, email, status: "created", password });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        results.push({
          row: rowNumber,
          name,
          email,
          status: "skipped",
          message: "A user with that email already exists.",
        });
      } else {
        results.push({
          row: rowNumber,
          name,
          email,
          status: "skipped",
          message: "Unexpected error creating this student.",
        });
      }
    }
  }

  if (results.length === 0) {
    return { error: "No data rows found in the sheet." };
  }

  if (results.some((r) => r.status === "created")) {
    revalidatePath("/admin/students");
  }

  return { results };
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
