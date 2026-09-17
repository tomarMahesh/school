import { prisma } from "@/lib/prisma";

export type FeeStatus = "UNPAID" | "PARTIAL" | "PAID" | "NO_STRUCTURE";

export async function getStudentFeeStatus(studentId: string, term: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { classId: true },
  });
  if (!student?.classId) {
    return { status: "NO_STRUCTURE" as FeeStatus, amountDue: 0, amountPaid: 0 };
  }

  const [structure, payments] = await Promise.all([
    prisma.feeStructure.findUnique({
      where: { classId_term: { classId: student.classId, term } },
    }),
    prisma.feePayment.aggregate({
      where: { studentId, term },
      _sum: { amount: true },
    }),
  ]);

  const amountDue = structure?.amount ?? 0;
  const amountPaid = payments._sum.amount ?? 0;

  let status: FeeStatus = "NO_STRUCTURE";
  if (structure) {
    if (amountPaid <= 0) status = "UNPAID";
    else if (amountPaid < amountDue) status = "PARTIAL";
    else status = "PAID";
  }

  return { status, amountDue, amountPaid };
}
