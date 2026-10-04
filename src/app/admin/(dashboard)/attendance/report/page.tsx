import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AttendanceReportFilters } from "@/components/admin/AttendanceReportFilters";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  STATUS_ABBR,
  STATUS_BADGE,
  MONTH_NAMES,
  daysInMonth,
  summarize,
} from "@/lib/attendanceReport";

function todayMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(monthStr: string) {
  return new Date(`${monthStr}-01`);
}

function startOfNextMonth(monthStr: string) {
  const [y, m] = monthStr.split("-").map(Number);
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  return new Date(`${nextY}-${String(nextM).padStart(2, "0")}-01`);
}

function startOfYear(yearStr: string) {
  return new Date(`${yearStr}-01-01`);
}

function startOfNextYear(yearStr: string) {
  return new Date(`${Number(yearStr) + 1}-01-01`);
}

export default async function AttendanceReportPage(
  props: PageProps<"/admin/attendance/report">,
) {
  const searchParams = await props.searchParams;

  const currentYear = await getCurrentAcademicYear();
  const academicYears = await prisma.academicYear.findMany({
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  });

  const mode = searchParams.mode === "student" ? "student" : "class";
  const period = searchParams.period === "year" ? "year" : "month";
  const academicYearId =
    (typeof searchParams.academicYearId === "string" && searchParams.academicYearId) ||
    currentYear?.id ||
    "";
  const classId =
    typeof searchParams.classId === "string" ? searchParams.classId : "";
  const studentId =
    typeof searchParams.studentId === "string" ? searchParams.studentId : "";
  const month =
    typeof searchParams.month === "string" ? searchParams.month : todayMonth();
  const year =
    typeof searchParams.year === "string"
      ? searchParams.year
      : String(new Date().getFullYear());

  const yearsForPicker = Array.from(
    new Set(
      academicYears.flatMap((y) => [y.startDate.getFullYear(), y.endDate.getFullYear()]),
    ).add(new Date().getFullYear()),
  ).sort((a, b) => b - a);

  const [classes, students] = await Promise.all([
    prisma.class.findMany({
      where: { academicYearId },
      orderBy: { name: "asc" },
    }),
    prisma.student.findMany({
      where: { class: { academicYearId } },
      include: { user: true, class: true },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Attendance Report"
        description="Monthly or yearly attendance for a class or an individual student."
        action={
          <Link href="/admin/attendance" className="text-sm underline">
            ← Back to mark attendance
          </Link>
        }
      />

      <AttendanceReportFilters
        academicYears={academicYears}
        classes={classes}
        students={students.map((s) => ({
          id: s.id,
          name: s.user.name,
          className: s.class?.name ?? null,
        }))}
        years={yearsForPicker}
        mode={mode}
        period={period}
        academicYearId={academicYearId}
        classId={classId}
        studentId={studentId}
        month={month}
        year={year}
      >
        {mode === "class" ? (
          classId ? (
            period === "month" ? (
              <ClassMonthReport classId={classId} month={month} />
            ) : (
              <ClassYearReport classId={classId} year={year} />
            )
          ) : (
            <EmptyState message="Select a class to see its report." />
          )
        ) : studentId ? (
          period === "month" ? (
            <StudentMonthReport studentId={studentId} month={month} />
          ) : (
            <StudentYearReport studentId={studentId} year={year} />
          )
        ) : (
          <EmptyState message="Select a student to see their report." />
        )}
      </AttendanceReportFilters>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="p-10 text-center text-sm text-muted-foreground">{message}</Card>
  );
}

async function ClassMonthReport({ classId, month }: { classId: string; month: string }) {
  const [klass, records] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      include: { students: { include: { user: true }, orderBy: { user: { name: "asc" } } } },
    }),
    prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startOfMonth(month), lt: startOfNextMonth(month) },
      },
    }),
  ]);

  if (!klass) return <EmptyState message="Class not found." />;

  const [y, m] = month.split("-").map(Number);
  const numDays = daysInMonth(y, m);
  const days = Array.from({ length: numDays }, (_, i) => i + 1);

  const byStudent = new Map<string, Map<number, string>>();
  for (const r of records) {
    const day = r.date.getUTCDate();
    if (!byStudent.has(r.studentId)) byStudent.set(r.studentId, new Map());
    byStudent.get(r.studentId)!.set(day, r.status);
  }

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Student</TableHead>
              {days.map((d) => (
                <TableHead key={d} className="w-8 text-center">
                  {d}
                </TableHead>
              ))}
              <TableHead className="text-center">P</TableHead>
              <TableHead className="text-center">A</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {klass.students.map((student) => {
              const dayMap = byStudent.get(student.id) ?? new Map<number, string>();
              const summary = summarize(days.map((d) => dayMap.get(d) ?? "").filter(Boolean));
              return (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 whitespace-nowrap bg-card font-medium">
                    {student.user.name}
                  </TableCell>
                  {days.map((d) => {
                    const status = dayMap.get(d);
                    return (
                      <TableCell key={d} className="p-1 text-center">
                        {status ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-medium ${STATUS_BADGE[status]}`}
                          >
                            {STATUS_ABBR[status]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center text-muted-foreground">
                    {summary.present}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {summary.absent}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {summary.late}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {summary.pct !== null ? `${summary.pct}%` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {klass.students.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={numDays + 5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No students in this class.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

async function ClassYearReport({ classId, year }: { classId: string; year: string }) {
  const [klass, records] = await Promise.all([
    prisma.class.findUnique({
      where: { id: classId },
      include: { students: { include: { user: true }, orderBy: { user: { name: "asc" } } } },
    }),
    prisma.attendance.findMany({
      where: {
        classId,
        date: { gte: startOfYear(year), lt: startOfNextYear(year) },
      },
    }),
  ]);

  if (!klass) return <EmptyState message="Class not found." />;

  const byStudentMonth = new Map<string, Map<number, string[]>>();
  for (const r of records) {
    const monthNum = r.date.getUTCMonth() + 1;
    if (!byStudentMonth.has(r.studentId)) byStudentMonth.set(r.studentId, new Map());
    const monthMap = byStudentMonth.get(r.studentId)!;
    if (!monthMap.has(monthNum)) monthMap.set(monthNum, []);
    monthMap.get(monthNum)!.push(r.status);
  }

  return (
    <Card className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card">Student</TableHead>
              {MONTH_NAMES.map((name) => (
                <TableHead key={name} className="text-center">
                  {name}
                </TableHead>
              ))}
              <TableHead className="text-center">Yearly %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {klass.students.map((student) => {
              const monthMap = byStudentMonth.get(student.id) ?? new Map<number, string[]>();
              const allStatuses = Array.from(monthMap.values()).flat();
              const yearSummary = summarize(allStatuses);
              return (
                <TableRow key={student.id}>
                  <TableCell className="sticky left-0 whitespace-nowrap bg-card font-medium">
                    {student.user.name}
                  </TableCell>
                  {MONTH_NAMES.map((_, i) => {
                    const monthStatuses = monthMap.get(i + 1) ?? [];
                    const s = summarize(monthStatuses);
                    return (
                      <TableCell key={i} className="text-center text-muted-foreground">
                        {s.pct !== null ? `${s.pct}%` : "—"}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-medium">
                    {yearSummary.pct !== null ? `${yearSummary.pct}%` : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            {klass.students.length === 0 && (
              <TableRow>
                <TableCell colSpan={14} className="py-10 text-center text-muted-foreground">
                  No students in this class.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

async function StudentMonthReport({
  studentId,
  month,
}: {
  studentId: string;
  month: string;
}) {
  const [student, records] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: true },
    }),
    prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: startOfMonth(month), lt: startOfNextMonth(month) },
      },
    }),
  ]);

  if (!student) return <EmptyState message="Student not found." />;

  const [y, m] = month.split("-").map(Number);
  const numDays = daysInMonth(y, m);
  const byDay = new Map(records.map((r) => [r.date.getUTCDate(), r.status]));
  const summary = summarize(records.map((r) => r.status));

  // Calendar grid: first day of month's weekday determines leading blanks.
  const firstWeekday = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0=Sun
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="flex flex-col gap-4">
      <Card className="max-w-md p-4">
        <p className="text-sm text-muted-foreground">
          {student.user.name}
          {student.class ? ` · ${student.class.name}` : ""}
        </p>
        <div className="mt-3 grid grid-cols-4 gap-3 text-center text-sm">
          <div>
            <p className="text-lg font-semibold">{summary.present}</p>
            <p className="text-muted-foreground">Present</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{summary.absent}</p>
            <p className="text-muted-foreground">Absent</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{summary.late}</p>
            <p className="text-muted-foreground">Late</p>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {summary.pct !== null ? `${summary.pct}%` : "—"}
            </p>
            <p className="text-muted-foreground">Attendance</p>
          </div>
        </div>
      </Card>

      <Card className="max-w-md p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const status = day ? byDay.get(day) : undefined;
            return (
              <div
                key={i}
                className={`flex h-9 flex-col items-center justify-center rounded text-xs ${
                  day ? "border border-input" : ""
                } ${status ? STATUS_BADGE[status] : ""}`}
              >
                {day ?? ""}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

async function StudentYearReport({
  studentId,
  year,
}: {
  studentId: string;
  year: string;
}) {
  const [student, records] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: true },
    }),
    prisma.attendance.findMany({
      where: {
        studentId,
        date: { gte: startOfYear(year), lt: startOfNextYear(year) },
      },
    }),
  ]);

  if (!student) return <EmptyState message="Student not found." />;

  const byMonth = new Map<number, string[]>();
  for (const r of records) {
    const monthNum = r.date.getUTCMonth() + 1;
    if (!byMonth.has(monthNum)) byMonth.set(monthNum, []);
    byMonth.get(monthNum)!.push(r.status);
  }
  const yearSummary = summarize(records.map((r) => r.status));

  return (
    <div className="flex flex-col gap-4">
      <Card className="max-w-sm p-4">
        <p className="text-sm text-muted-foreground">
          {student.user.name}
          {student.class ? ` · ${student.class.name}` : ""}
        </p>
        <p className="mt-2 text-2xl font-semibold">
          {yearSummary.pct !== null ? `${yearSummary.pct}%` : "—"}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            for {year}
          </span>
        </p>
      </Card>

      <Card className="max-w-md p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-center">Present</TableHead>
              <TableHead className="text-center">Absent</TableHead>
              <TableHead className="text-center">Late</TableHead>
              <TableHead className="text-center">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MONTH_NAMES.map((name, i) => {
              const s = summarize(byMonth.get(i + 1) ?? []);
              return (
                <TableRow key={name}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {s.present}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {s.absent}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {s.late}
                  </TableCell>
                  <TableCell className="text-center">
                    {s.pct !== null ? (
                      <Badge variant="secondary">{s.pct}%</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
