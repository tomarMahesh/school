import { BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { markAttendance } from "@/lib/actions/attendance";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { Card } from "@/components/ui/card";
import { PersistentForm } from "@/components/PersistentForm";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// No requirePermission() here on purpose: attendance is not a grantable
// permission (see proxy.ts) -- only ADMIN reaches this route at all, and
// each class's own teacher gets the equivalent view+mark page under
// /portal/classes/[classId]/attendance instead.
export default async function AdminAttendancePage(
  props: PageProps<"/admin/attendance">,
) {
  const searchParams = await props.searchParams;
  const date =
    typeof searchParams.date === "string" ? searchParams.date : todayIso();
  const selectedClassId =
    typeof searchParams.classId === "string" ? searchParams.classId : undefined;

  const classes = await prisma.class.findMany({
    include: { academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
  });

  const klass = selectedClassId
    ? await prisma.class.findUnique({
        where: { id: selectedClassId },
        include: { students: { include: { user: true } } },
      })
    : null;

  const records = klass
    ? await prisma.attendance.findMany({
        where: { classId: klass.id, date: new Date(date) },
      })
    : [];
  const byStudent = new Map(records.map((r) => [r.studentId, r.status]));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Attendance"
        description="View and mark attendance for any class. Only admins and each class's own teacher have access."
        action={
          <LinkButton href="/admin/attendance/report" variant="outline">
            <BarChart3 />
            Monthly / Yearly Report
          </LinkButton>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Class
          <select
            name="classId"
            defaultValue={selectedClassId ?? ""}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">Select a class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.academicYear.name})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Date
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          View
        </button>
      </form>

      {klass && (
        <Card className="max-w-lg p-4">
          <PersistentForm
            action={markAttendance.bind(null, klass.id, date)}
            className="flex flex-col gap-4"
          >
            {klass.students.map((student) => {
              const current = byStudent.get(student.id) ?? "PRESENT";
              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between border-b pb-2 text-sm"
                >
                  <span>{student.user.name}</span>
                  <select
                    name={`status_${student.id}`}
                    defaultValue={current}
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
                </div>
              );
            })}
            {klass.students.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No students in this class.
              </p>
            )}
            {klass.students.length > 0 && (
              <button
                type="submit"
                className="mt-2 w-fit rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
              >
                Save Attendance
              </button>
            )}
          </PersistentForm>
        </Card>
      )}
    </div>
  );
}
