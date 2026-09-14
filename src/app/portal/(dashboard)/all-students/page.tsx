import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AllStudentsPage() {
  const session = await auth();
  if (session?.user.role !== "PRINCIPAL") redirect("/portal");

  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">All Students</h1>
      <table className="mt-6 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Class</th>
            <th className="py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{student.user.name}</td>
              <td className="py-2">{student.class?.name ?? "—"}</td>
              <td className="py-2 opacity-70">{student.user.email}</td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center opacity-60">
                No students yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
