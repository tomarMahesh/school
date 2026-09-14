import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyAttendancePage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal/classes");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { attendance: { orderBy: { date: "desc" } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Attendance</h1>

      <table className="mt-6 w-full max-w-md text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Date</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {student?.attendance.map((record) => (
            <tr
              key={record.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{record.date.toLocaleDateString()}</td>
              <td className="py-2">{record.status}</td>
            </tr>
          ))}
          {(!student || student.attendance.length === 0) && (
            <tr>
              <td colSpan={2} className="py-6 text-center opacity-60">
                No attendance records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
