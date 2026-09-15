import { prisma } from "@/lib/prisma";
import { createSection, deleteSection } from "@/lib/actions/masters";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminSectionsPage() {
  const sections = await prisma.section.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Sections</h1>

      <div className="mt-6">
        <InlineCreateForm action={createSection} submitLabel="Add Section">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              required
              placeholder="A"
              className="w-28 rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
        </InlineCreateForm>
      </div>

      <table className="mt-8 w-full max-w-xs text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s) => (
            <tr key={s.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{s.name}</td>
              <td className="py-2">
                <DeleteButton
                  action={deleteSection.bind(null, s.id)}
                  confirmMessage={`Delete section "${s.name}"?`}
                />
              </td>
            </tr>
          ))}
          {sections.length === 0 && (
            <tr>
              <td colSpan={2} className="py-6 text-center opacity-60">
                No sections yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
