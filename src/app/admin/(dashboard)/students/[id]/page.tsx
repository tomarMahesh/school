import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/admin/StudentForm";
import { updateStudent } from "@/lib/actions/students";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!student) notFound();

  const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Student</h1>
      <StudentForm
        action={updateStudent.bind(null, student.id)}
        initial={{
          name: student.user.name,
          email: student.user.email,
          classId: student.classId,
        }}
        classes={classes}
        submitLabel="Save Changes"
      />
    </div>
  );
}
