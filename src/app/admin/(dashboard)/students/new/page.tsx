import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/admin/StudentForm";
import { createStudent } from "@/lib/actions/students";

export default async function NewStudentPage() {
  const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Admit Student</h1>
      <StudentForm action={createStudent} classes={classes} submitLabel="Admit Student" />
    </div>
  );
}
