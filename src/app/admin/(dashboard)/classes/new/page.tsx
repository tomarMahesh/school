import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/admin/ClassForm";
import { createClass } from "@/lib/actions/classes";

export default async function NewClassPage() {
  const staff = await prisma.staff.findMany({
    where: { user: { role: { in: ["TEACHER", "PRINCIPAL"] } } },
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });
  const teachers = staff.map((s) => ({
    id: s.id,
    name: s.user.name,
    designation: s.designation,
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Class</h1>
      <ClassForm action={createClass} teachers={teachers} submitLabel="Create Class" />
    </div>
  );
}
