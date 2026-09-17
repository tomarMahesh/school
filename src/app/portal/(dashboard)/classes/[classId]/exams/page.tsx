import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClassExamsPage(
  props: PageProps<"/portal/classes/[classId]/exams">,
) {
  const { classId } = await props.params;
  const session = await auth();
  const role = session?.user.role;
  if (role !== "TEACHER" && role !== "PRINCIPAL") redirect("/portal");

  const staff = await prisma.staff.findUnique({
    where: { userId: session!.user.id },
  });

  const klass = await prisma.class.findUnique({ where: { id: classId } });
  if (!klass) notFound();

  const isOwnClass = klass.teacherId === staff?.id;
  if (role === "TEACHER" && !isOwnClass) notFound();

  const exams = await prisma.exam.findMany({
    where: { classId },
    include: { subjects: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Exams — {klass.name}</h1>

      <table className="mt-6 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Exam</th>
            <th className="py-2">Term</th>
            <th className="py-2">Subjects</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{exam.name}</td>
              <td className="py-2">{exam.term}</td>
              <td className="py-2">{exam.subjects.length}</td>
              <td className="py-2">{exam.published ? "Published" : "Draft"}</td>
              <td className="py-2">
                {isOwnClass ? (
                  <Link
                    href={`/portal/classes/${classId}/exams/${exam.id}`}
                    className="underline"
                  >
                    Enter Marks
                  </Link>
                ) : (
                  <span className="opacity-60">Read-only</span>
                )}
              </td>
            </tr>
          ))}
          {exams.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center opacity-60">
                No exams scheduled for this class yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
