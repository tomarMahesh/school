import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveExamMarks } from "@/lib/actions/examMarks";
import { PersistentForm } from "@/components/PersistentForm";

export default async function EnterMarksPage(
  props: PageProps<"/portal/classes/[classId]/exams/[examId]">,
) {
  const { classId, examId } = await props.params;
  const session = await auth();
  const role = session?.user.role;
  if (role !== "TEACHER" && role !== "PRINCIPAL") redirect("/portal");

  const staff = await prisma.staff.findUnique({
    where: { userId: session!.user.id },
  });

  const klass = await prisma.class.findUnique({
    where: { id: classId },
    include: { students: { include: { user: true } } },
  });
  if (!klass) notFound();

  const isOwnClass = klass.teacherId === staff?.id;
  if (!isOwnClass) notFound();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { subjects: { include: { subject: true, marks: true } } },
  });
  if (!exam || exam.classId !== classId) notFound();

  const action = saveExamMarks.bind(null, examId);

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Enter Marks — {exam.name} ({klass.name})
      </h1>
      <p className="mt-1 text-sm opacity-60">
        {exam.published
          ? "Results are published — students can already see these marks."
          : "Results are not yet published to students."}
      </p>

      {exam.subjects.length === 0 ? (
        <p className="mt-6 opacity-60">
          No subjects added to this exam yet — ask the admin to add subjects
          first.
        </p>
      ) : (
        <PersistentForm action={action} className="mt-6">
          <table className="w-full max-w-3xl text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 dark:border-white/10">
                <th className="py-2">Student</th>
                {exam.subjects.map((es) => (
                  <th key={es.id} className="py-2">
                    {es.subject.name}
                    <span className="ml-1 opacity-50">/ {es.maxMarks}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {klass.students.map((student) => (
                <tr
                  key={student.id}
                  className="border-b border-black/5 dark:border-white/5"
                >
                  <td className="py-2">{student.user.name}</td>
                  {exam.subjects.map((es) => {
                    const existing = es.marks.find((m) => m.studentId === student.id);
                    return (
                      <td key={es.id} className="py-2 pr-4">
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          max={es.maxMarks}
                          name={`marks_${es.id}_${student.id}`}
                          defaultValue={existing?.marksObtained ?? ""}
                          className="w-20 rounded border border-black/20 px-2 py-1 dark:border-white/20"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
              {klass.students.length === 0 && (
                <tr>
                  <td
                    colSpan={exam.subjects.length + 1}
                    className="py-6 text-center opacity-60"
                  >
                    No students in this class yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {klass.students.length > 0 && (
            <button
              type="submit"
              className="mt-4 rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Save Marks
            </button>
          )}
        </PersistentForm>
      )}
    </div>
  );
}
