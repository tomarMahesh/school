import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStudentFeeStatus } from "@/lib/fees";

const STATUS_LABEL: Record<string, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
  NO_STRUCTURE: "No fee set",
};

export default async function MyFeesPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: {
      class: true,
      feePayments: { orderBy: { paidAt: "desc" } },
    },
  });

  const structures = student?.classId
    ? await prisma.feeStructure.findMany({
        where: { classId: student.classId },
        orderBy: { term: "asc" },
      })
    : [];

  const statuses = student
    ? await Promise.all(
        structures.map(async (s) => ({
          term: s.term,
          amount: s.amount,
          ...(await getStudentFeeStatus(student.id, s.term)),
        })),
      )
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Fees</h1>
      <p className="mt-1 text-sm opacity-60">
        {student?.class?.name
          ? `Fee terms for ${student.class.name}.`
          : "You are not assigned to a class yet."}
      </p>

      <h2 className="mt-8 text-lg font-medium">Fee Status by Term</h2>
      <table className="mt-3 w-full max-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Term</th>
            <th className="py-2">Due</th>
            <th className="py-2">Paid</th>
            <th className="py-2">Pending</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {statuses.map((s) => (
            <tr key={s.term} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{s.term}</td>
              <td className="py-2">{s.amountDue.toFixed(2)}</td>
              <td className="py-2">{s.amountPaid.toFixed(2)}</td>
              <td className="py-2">
                {Math.max(s.amountDue - s.amountPaid, 0).toFixed(2)}
              </td>
              <td className="py-2">{STATUS_LABEL[s.status]}</td>
            </tr>
          ))}
          {statuses.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center opacity-60">
                No fee structure set for your class yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-10 text-lg font-medium">Payment History</h2>
      <table className="mt-3 w-full max-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Date</th>
            <th className="py-2">Term</th>
            <th className="py-2">Amount</th>
            <th className="py-2">Method</th>
          </tr>
        </thead>
        <tbody>
          {student?.feePayments.map((p) => (
            <tr key={p.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{p.paidAt.toLocaleDateString()}</td>
              <td className="py-2">{p.term}</td>
              <td className="py-2">{p.amount.toFixed(2)}</td>
              <td className="py-2 opacity-70">{p.method ?? "—"}</td>
            </tr>
          ))}
          {(!student || student.feePayments.length === 0) && (
            <tr>
              <td colSpan={4} className="py-6 text-center opacity-60">
                No payments recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
