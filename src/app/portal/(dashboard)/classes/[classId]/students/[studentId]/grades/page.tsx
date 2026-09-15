import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addGrade, deleteGrade } from "@/lib/actions/grades";
import { GradeForm } from "@/components/portal/GradeForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function StudentGradesPage(
  props: PageProps<"/portal/classes/[classId]/students/[studentId]/grades">,
) {
  const { classId, studentId } = await props.params;
  const session = await auth();
  const role = session?.user.role;
  if (role !== "TEACHER" && role !== "PRINCIPAL") redirect("/portal");

  const staff = await prisma.staff.findUnique({
    where: { userId: session!.user.id },
  });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      class: true,
      grades: { orderBy: { createdAt: "desc" }, include: { subject: true } },
    },
  });

  if (!student || student.classId !== classId) notFound();

  const canEdit = student.class?.teacherId === staff?.id;
  if (role === "TEACHER" && !canEdit) notFound();

  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const action = addGrade.bind(null, studentId);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Grades — {student.user.name}</h1>
      {!canEdit && (
        <p className="mt-1 text-sm opacity-60">
          Read-only — you are not the assigned teacher for this student.
        </p>
      )}

      {canEdit && (
        <div className="mt-6">
          <GradeForm action={action} subjects={subjects} />
        </div>
      )}

      <table className="mt-8 w-full max-w-xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Subject</th>
            <th className="py-2">Term</th>
            <th className="py-2">Score</th>
            {canEdit && <th className="py-2"></th>}
          </tr>
        </thead>
        <tbody>
          {student.grades.map((grade) => (
            <tr
              key={grade.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{grade.subject.name}</td>
              <td className="py-2">{grade.term}</td>
              <td className="py-2">
                {grade.score} / {grade.maxScore}
              </td>
              {canEdit && (
                <td className="py-2">
                  <DeleteButton
                    action={deleteGrade.bind(null, grade.id, studentId)}
                    confirmMessage={`Delete this ${grade.subject.name} grade?`}
                  />
                </td>
              )}
            </tr>
          ))}
          {student.grades.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 4 : 3} className="py-6 text-center opacity-60">
                No grades recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
