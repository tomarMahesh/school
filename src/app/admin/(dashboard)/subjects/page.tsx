import { prisma } from "@/lib/prisma";
import { createSubject, deleteSubject } from "@/lib/actions/masters";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Subjects</h1>

      <div className="mt-6">
        <InlineCreateForm action={createSubject} submitLabel="Add Subject">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              required
              placeholder="Mathematics"
              className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Code (optional)
            <input
              name="code"
              placeholder="MATH"
              className="w-28 rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
        </InlineCreateForm>
      </div>

      <table className="mt-8 w-full max-w-md text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Code</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{s.name}</td>
              <td className="py-2 opacity-70">{s.code ?? "—"}</td>
              <td className="py-2">
                <DeleteButton
                  action={deleteSubject.bind(null, s.id)}
                  confirmMessage={`Delete subject "${s.name}"?`}
                />
              </td>
            </tr>
          ))}
          {subjects.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center opacity-60">
                No subjects yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
