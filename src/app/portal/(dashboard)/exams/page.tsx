import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyScheduledExamsPage() {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  const exams = student?.classId
    ? await prisma.exam.findMany({
        where: { classId: student.classId },
        include: { subjects: { include: { subject: true } } },
        orderBy: { examDate: "asc" },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Scheduled Exams</h1>
      <p className="mt-1 text-sm opacity-60">
        Your class&apos;s upcoming and past exam schedule. Download your hall
        ticket once the required fees are paid.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="flex flex-col gap-2 border-b border-black/10 pb-4 dark:border-white/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-medium">
                  {exam.name}{" "}
                  <span className="text-sm font-normal opacity-60">
                    ({exam.term})
                  </span>
                </h2>
                <p className="text-sm opacity-60">
                  {exam.examDate
                    ? exam.examDate.toLocaleDateString()
                    : "Date not announced yet"}
                </p>
              </div>
              <Link
                href={`/portal/hall-ticket/${exam.id}`}
                className="rounded border border-black/20 px-3 py-1.5 text-sm dark:border-white/20"
              >
                Hall Ticket
              </Link>
            </div>
            {exam.subjects.length > 0 && (
              <p className="text-sm opacity-70">
                Subjects: {exam.subjects.map((es) => es.subject.name).join(", ")}
              </p>
            )}
          </div>
        ))}
        {exams.length === 0 && (
          <p className="opacity-60">No exams scheduled for your class yet.</p>
        )}
      </div>
    </div>
  );
}
