import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteStudent } from "@/lib/actions/students";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Students</h1>
        <Link
          href="/admin/students/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Admit Student
        </Link>
      </div>

      <table className="mt-6 w-full max-w-3xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Class</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{student.user.name}</td>
              <td className="py-2 opacity-70">{student.user.email}</td>
              <td className="py-2">{student.class?.name ?? "—"}</td>
              <td className="flex gap-4 py-2">
                <Link href={`/admin/students/${student.id}`} className="underline">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteStudent.bind(null, student.id)}
                  confirmMessage={`Remove student "${student.user.name}"? This deletes their account and all records.`}
                />
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center opacity-60">
                No students yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
