import { prisma } from "@/lib/prisma";
import {
  createAcademicYear,
  deleteAcademicYear,
  setCurrentAcademicYear,
} from "@/lib/actions/masters";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminAcademicYearsPage() {
  const years = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Academic Years</h1>

      <div className="mt-6">
        <InlineCreateForm action={createAcademicYear} submitLabel="Add Year">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              required
              placeholder="2026-2027"
              className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Start Date
            <input
              name="startDate"
              type="date"
              required
              className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            End Date
            <input
              name="endDate"
              type="date"
              required
              className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
        </InlineCreateForm>
      </div>

      <table className="mt-8 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Start</th>
            <th className="py-2">End</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {years.map((year) => (
            <tr key={year.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{year.name}</td>
              <td className="py-2 opacity-70">{year.startDate.toLocaleDateString()}</td>
              <td className="py-2 opacity-70">{year.endDate.toLocaleDateString()}</td>
              <td className="py-2">
                {year.isCurrent ? (
                  <span className="font-medium">Current</span>
                ) : (
                  <form action={setCurrentAcademicYear.bind(null, year.id)}>
                    <button type="submit" className="underline">
                      Set as current
                    </button>
                  </form>
                )}
              </td>
              <td className="py-2">
                <DeleteButton
                  action={deleteAcademicYear.bind(null, year.id)}
                  confirmMessage={`Delete academic year "${year.name}"?`}
                />
              </td>
            </tr>
          ))}
          {years.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center opacity-60">
                No academic years yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
