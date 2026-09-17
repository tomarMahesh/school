import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyResultsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal/classes");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  const exams = student
    ? await prisma.exam.findMany({
        where: { classId: student.classId ?? undefined, published: true },
        include: {
          subjects: {
            include: {
              subject: true,
              marks: { where: { studentId: student.id } },
            },
          },
        },
        orderBy: { examDate: "desc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Results</h1>

      <div className="mt-6 flex flex-col gap-8">
        {exams.map((exam) => {
          const totalMax = exam.subjects.reduce((sum, es) => sum + es.maxMarks, 0);
          const totalObtained = exam.subjects.reduce(
            (sum, es) => sum + (es.marks[0]?.marksObtained ?? 0),
            0,
          );
          return (
            <div key={exam.id}>
              <h2 className="text-lg font-medium">
                {exam.name}{" "}
                <span className="text-sm font-normal opacity-60">
                  ({exam.term})
                </span>
              </h2>
              <table className="mt-2 w-full max-w-md text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10">
                    <th className="py-2">Subject</th>
                    <th className="py-2">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {exam.subjects.map((es) => (
                    <tr
                      key={es.id}
                      className="border-b border-black/5 dark:border-white/5"
                    >
                      <td className="py-2">{es.subject.name}</td>
                      <td className="py-2">
                        {es.marks[0] ? es.marks[0].marksObtained : "—"} /{" "}
                        {es.maxMarks}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="py-2">Total</td>
                    <td className="py-2">
                      {totalObtained} / {totalMax}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
        {exams.length === 0 && (
          <p className="opacity-60">No published results yet.</p>
        )}
      </div>
    </div>
  );
}
