import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_BADGE, MONTH_NAMES, summarize } from "@/lib/attendanceReport";

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

export default async function MyAttendancePage(
  props: PageProps<"/portal/attendance">,
) {
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal/classes");

  const searchParams = await props.searchParams;
  const period = searchParams.period === "year" ? "year" : "month";
  const month =
    typeof searchParams.month === "string" ? searchParams.month : todayMonth();
  const year =
    typeof searchParams.year === "string"
      ? searchParams.year
      : String(new Date().getFullYear());

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  const records = student
    ? await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date:
            period === "month"
              ? { gte: startOfMonth(month), lt: startOfNextMonth(month) }
              : { gte: startOfYear(year), lt: startOfNextYear(year) },
        },
        orderBy: { date: "desc" },
      })
    : [];

  const summary = summarize(records.map((r) => r.status));

  const byMonth = new Map<number, string[]>();
  if (period === "year") {
    for (const r of records) {
      const m = r.date.getUTCMonth() + 1;
      if (!byMonth.has(m)) byMonth.set(m, []);
      byMonth.get(m)!.push(r.status);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Attendance</h1>

      <form method="get" className="mt-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="flex flex-col gap-1">
          Period
          <select
            name="period"
            defaultValue={period}
            className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>
        {period === "month" ? (
          <label className="flex flex-col gap-1">
            Month
            <input
              type="month"
              name="month"
              defaultValue={month}
              className="rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1">
            Year
            <input
              type="number"
              name="year"
              defaultValue={year}
              className="w-24 rounded border border-black/20 px-2 py-1 dark:border-white/20"
            />
          </label>
        )}
        <button
          type="submit"
          className="rounded border border-black/20 px-3 py-1 dark:border-white/20"
        >
          View
        </button>
      </form>

      <div className="mt-6 grid max-w-md grid-cols-4 gap-3 text-center text-sm">
        <div>
          <p className="text-lg font-semibold">{summary.present}</p>
          <p className="opacity-60">Present</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{summary.absent}</p>
          <p className="opacity-60">Absent</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{summary.late}</p>
          <p className="opacity-60">Late</p>
        </div>
        <div>
          <p className="text-lg font-semibold">
            {summary.pct !== null ? `${summary.pct}%` : "—"}
          </p>
          <p className="opacity-60">Attendance</p>
        </div>
      </div>

      {period === "year" && (
        <table className="mt-6 w-full max-w-md text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2">Month</th>
              <th className="py-2">Present</th>
              <th className="py-2">Absent</th>
              <th className="py-2">Late</th>
              <th className="py-2">%</th>
            </tr>
          </thead>
          <tbody>
            {MONTH_NAMES.map((name, i) => {
              const s = summarize(byMonth.get(i + 1) ?? []);
              return (
                <tr key={name} className="border-b border-black/5 dark:border-white/5">
                  <td className="py-2">{name}</td>
                  <td className="py-2">{s.present}</td>
                  <td className="py-2">{s.absent}</td>
                  <td className="py-2">{s.late}</td>
                  <td className="py-2">{s.pct !== null ? `${s.pct}%` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {period === "month" && (
        <table className="mt-6 w-full max-w-md text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              <th className="py-2">Date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-black/5 dark:border-white/5"
              >
                <td className="py-2">{record.date.toLocaleDateString()}</td>
                <td className="py-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[record.status] ?? ""}`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={2} className="py-6 text-center opacity-60">
                  No attendance records for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
