import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassForm } from "@/components/admin/ClassForm";
import { updateClass } from "@/lib/actions/classes";

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const klass = await prisma.class.findUnique({ where: { id } });
  if (!klass) notFound();

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
  const sections = await prisma.section.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Class</h1>
      <ClassForm
        action={updateClass.bind(null, klass.id)}
        initial={{
          name: klass.name,
          teacherId: klass.teacherId,
          sectionId: klass.sectionId,
        }}
        teachers={teachers}
        sections={sections}
        submitLabel="Save Changes"
      />
    </div>
  );
}
