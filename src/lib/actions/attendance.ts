"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Only ADMIN (full access to every class) and the class's own assigned
// teacher may view or mark its attendance -- not Principal/Staff at
// large, and not a Teacher who isn't that class's teacher.
async function requireAdminOrClassTeacher(classId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  if (session.user.role === "ADMIN") {
    return { markedById: null as string | null };
  }

  if (session.user.role !== "TEACHER" && session.user.role !== "PRINCIPAL") {
    throw new Error("Unauthorized");
  }

  const staff = await prisma.staff.findUnique({
    where: { userId: session.user.id },
  });
  if (!staff) throw new Error("Unauthorized");

  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass || klass.teacherId !== staff.id) {
    throw new Error("Unauthorized: not your class");
  }

  return { markedById: staff.id };
}

const VALID_STATUSES = ["PRESENT", "ABSENT", "LATE"];

export async function markAttendance(
  classId: string,
  date: string,
  formData: FormData,
) {
  const { markedById } = await requireAdminOrClassTeacher(classId);

  const students = await prisma.student.findMany({
    where: { classId },
    select: { id: true },
  });

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date");
  }

  await prisma.$transaction(
    students.map(({ id: studentId }) => {
      const status = formData.get(`status_${studentId}`) as string;
      const safeStatus = VALID_STATUSES.includes(status) ? status : "PRESENT";

      return prisma.attendance.upsert({
        where: { studentId_date: { studentId, date: parsedDate } },
        create: {
          studentId,
          classId,
          date: parsedDate,
          status: safeStatus,
          markedById,
        },
        update: {
          status: safeStatus,
          markedById,
        },
      });
    }),
  );

  revalidatePath(`/portal/classes/${classId}/attendance`);
  revalidatePath("/admin/attendance");
}
