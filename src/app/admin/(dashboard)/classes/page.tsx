import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteClass } from "@/lib/actions/classes";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminClassesPage() {
  const classes = await prisma.class.findMany({
    include: { teacher: { include: { user: true } }, _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <Link
          href="/admin/classes/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          New Class
        </Link>
      </div>

      <table className="mt-6 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Teacher</th>
            <th className="py-2">Students</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {classes.map((klass) => (
            <tr key={klass.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{klass.name}</td>
              <td className="py-2 opacity-70">{klass.teacher?.user.name ?? "—"}</td>
              <td className="py-2">{klass._count.students}</td>
              <td className="flex gap-4 py-2">
                <Link href={`/admin/classes/${klass.id}`} className="underline">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteClass.bind(null, klass.id)}
                  confirmMessage={`Delete class "${klass.name}"? This will fail if students are still assigned to it.`}
                />
              </td>
            </tr>
          ))}
          {classes.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center opacity-60">
                No classes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
