import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyGradesPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal/classes");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { grades: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Grades</h1>

      <table className="mt-6 w-full max-w-md text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Subject</th>
            <th className="py-2">Term</th>
            <th className="py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {student?.grades.map((grade) => (
            <tr
              key={grade.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{grade.subject}</td>
              <td className="py-2">{grade.term}</td>
              <td className="py-2">
                {grade.score} / {grade.maxScore}
              </td>
            </tr>
          ))}
          {(!student || student.grades.length === 0) && (
            <tr>
              <td colSpan={3} className="py-6 text-center opacity-60">
                No grades recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
