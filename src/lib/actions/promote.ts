"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function promoteClasses(
  fromYearId: string,
  toYearId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (fromYearId === toYearId) {
    return { error: "From and To year must be different." };
  }

  const sourceClasses = await prisma.class.findMany({
    where: { academicYearId: fromYearId },
    include: { students: true },
  });

  let promotedCount = 0;

  for (const source of sourceClasses) {
    const targetName = (formData.get(`target_${source.id}`) as string)?.trim();
    if (!targetName) continue; // blank = don't promote this class

    const targetClass = await prisma.class.upsert({
      where: { name_academicYearId: { name: targetName, academicYearId: toYearId } },
      update: {},
      create: {
        name: targetName,
        academicYearId: toYearId,
        sectionId: source.sectionId,
      },
    });

    if (source.students.length > 0) {
      await prisma.student.updateMany({
        where: { id: { in: source.students.map((s) => s.id) } },
        data: { classId: targetClass.id },
      });
    }
    promotedCount += source.students.length;
  }

  if (promotedCount === 0) {
    return { error: "No students were promoted -- check the target class names." };
  }

  redirect("/admin/classes?year=" + toYearId);
}
