export const STATUS_ABBR: Record<string, string> = {
  PRESENT: "P",
  ABSENT: "A",
  LATE: "L",
};

export const STATUS_BADGE: Record<string, string> = {
  PRESENT: "bg-primary/10 text-primary",
  ABSENT: "bg-red-100 text-red-700",
  LATE: "bg-orange-100 text-orange-700",
};

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function daysInMonth(year: number, month: number) {
  // month is 1-12
  return new Date(year, month, 0).getDate();
}

export type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  total: number;
  /** Percent present out of marked days, or null if nothing was marked. */
  pct: number | null;
};

export function summarize(statuses: string[]): AttendanceSummary {
  const present = statuses.filter((s) => s === "PRESENT").length;
  const absent = statuses.filter((s) => s === "ABSENT").length;
  const late = statuses.filter((s) => s === "LATE").length;
  const total = statuses.length;
  const pct = total > 0 ? Math.round((present / total) * 1000) / 10 : null;
  return { present, absent, late, total, pct };
}
