import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClassDetailPage(
  props: PageProps<"/portal/classes/[classId]">,
) {
  const { classId } = await props.params;
  const session = await auth();
  if (session?.user.role !== "TEACHER") redirect("/portal");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
  });

  const klass = await prisma.class.findUnique({
    where: { id: classId },
    include: { students: { include: { user: true } } },
  });

  if (!klass || klass.teacherId !== teacher?.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold">{klass.name}</h1>

      <Link
        href={`/portal/classes/${klass.id}/attendance`}
        className="mt-4 inline-block rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Take Attendance
      </Link>

      <table className="mt-6 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Student</th>
            <th className="py-2">Email</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {klass.students.map((student) => (
            <tr
              key={student.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{student.user.name}</td>
              <td className="py-2 opacity-70">{student.user.email}</td>
              <td className="py-2">
                <Link
                  href={`/portal/classes/${klass.id}/students/${student.id}/grades`}
                  className="underline"
                >
                  Grades
                </Link>
              </td>
            </tr>
          ))}
          {klass.students.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center opacity-60">
                No students in this class yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
