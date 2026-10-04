import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/admin/ClassForm";
import { createClass } from "@/lib/actions/classes";

export default async function NewClassPage() {
  const [staff, sections, academicYears] = await Promise.all([
    prisma.staff.findMany({
      where: { user: { role: { in: ["TEACHER", "PRINCIPAL"] } } },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.section.findMany({ orderBy: { name: "asc" } }),
    prisma.academicYear.findMany({
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
    }),
  ]);
  const teachers = staff.map((s) => ({
    id: s.id,
    name: s.user.name,
    designation: s.designation,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Class</h1>
      <ClassForm
        action={createClass}
        teachers={teachers}
        sections={sections}
        academicYears={academicYears}
        submitLabel="Create Class"
      />
    </div>
  );
}
