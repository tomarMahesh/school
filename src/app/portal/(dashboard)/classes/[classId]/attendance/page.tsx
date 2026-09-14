import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markAttendance } from "@/lib/actions/attendance";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TakeAttendancePage(
  props: PageProps<"/portal/classes/[classId]/attendance">,
) {
  const { classId } = await props.params;
  const searchParams = await props.searchParams;
  const date =
    typeof searchParams.date === "string" ? searchParams.date : todayIso();

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

  const existing = await prisma.attendance.findMany({
    where: { classId, date: new Date(date) },
  });
  const existingByStudent = new Map(existing.map((a) => [a.studentId, a.status]));

  const action = markAttendance.bind(null, classId, date);

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Attendance — {klass.name}
      </h1>

      <form method="get" className="mt-4 flex items-center gap-2 text-sm">
        <label htmlFor="date">Date</label>
        <input
          type="date"
          id="date"
          name="date"
          defaultValue={date}
          className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded border border-black/20 px-3 py-1 dark:border-white/20"
        >
          Go
        </button>
      </form>

      <form action={action} className="mt-6 flex max-w-md flex-col gap-4">
        {klass.students.map((student) => {
          const current = existingByStudent.get(student.id) ?? "PRESENT";
          return (
            <div
              key={student.id}
              className="flex items-center justify-between border-b border-black/5 pb-2 dark:border-white/5"
            >
              <span>{student.user.name}</span>
              <select
                name={`status_${student.id}`}
                defaultValue={current}
                className="rounded border border-black/20 px-2 py-1 text-sm dark:border-white/20"
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          );
        })}
        {klass.students.length === 0 && (
          <p className="opacity-60">No students in this class yet.</p>
        )}
        {klass.students.length > 0 && (
          <button
            type="submit"
            className="mt-2 w-fit rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
          >
            Save Attendance
          </button>
        )}
      </form>
    </div>
  );
}
