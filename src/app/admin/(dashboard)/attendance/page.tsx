import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_BADGE: Record<string, string> = {
  PRESENT: "bg-primary/10 text-primary",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-orange-100 text-orange-700",
};

export default async function AdminAttendancePage(
  props: PageProps<"/admin/attendance">,
) {
  await requirePermission("admin.attendance");
  const searchParams = await props.searchParams;
  const date =
    typeof searchParams.date === "string" ? searchParams.date : todayIso();
  const selectedClassId =
    typeof searchParams.classId === "string" ? searchParams.classId : undefined;

  const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });

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
        description="Read-only overview of attendance recorded by teachers."
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
                {c.name}
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
        <Card className="max-w-lg p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {klass.students.map((student) => {
                const status = byStudent.get(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.user.name}</TableCell>
                    <TableCell>
                      {status ? (
                        <Badge className={STATUS_BADGE[status] ?? ""}>{status}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Not recorded</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {klass.students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                    No students in this class.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
