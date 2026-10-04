"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "cn";

export function AttendanceReportFilters({
  academicYears,
  classes,
  students,
  years,
  mode,
  period,
  academicYearId,
  classId,
  studentId,
  month,
  year,
  children,
}: {
  academicYears: { id: string; name: string; isCurrent: boolean }[];
  classes: { id: string; name: string }[];
  students: { id: string; name: string; className: string | null }[];
  years: number[];
  mode: "class" | "student";
  period: "month" | "year";
  academicYearId: string;
  classId: string;
  studentId: string;
  month: string;
  year: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => update({ mode: "class", studentId: null })}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            mode === "class"
              ? "bg-primary text-primary-foreground"
              : "border border-input text-foreground",
          )}
        >
          By Class
        </button>
        <button
          type="button"
          onClick={() => update({ mode: "student", classId: null })}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium",
            mode === "student"
              ? "bg-primary text-primary-foreground"
              : "border border-input text-foreground",
          )}
        >
          By Student
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Academic Year
          <select
            value={academicYearId}
            onChange={(e) =>
              update({ academicYearId: e.target.value, classId: null, studentId: null })
            }
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
                {y.isCurrent ? " (current)" : ""}
              </option>
            ))}
          </select>
        </label>

        {mode === "class" ? (
          <label className="flex flex-col gap-1.5 text-sm">
            Class
            <select
              value={classId}
              onChange={(e) => update({ classId: e.target.value })}
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
        ) : (
          <label className="flex flex-col gap-1.5 text-sm">
            Student
            <select
              value={studentId}
              onChange={(e) => update({ studentId: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.className ? ` (${s.className})` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          Period
          <select
            value={period}
            onChange={(e) => update({ period: e.target.value })}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </label>

        {period === "month" ? (
          <label className="flex flex-col gap-1.5 text-sm">
            Month
            <input
              type="month"
              value={month}
              onChange={(e) => e.target.value && update({ month: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            />
          </label>
        ) : (
          <label className="flex flex-col gap-1.5 text-sm">
            Year
            <select
              value={year}
              onChange={(e) => update({ year: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        )}

        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading" />
        )}
      </div>

      <div className={cn("transition-opacity", isPending && "pointer-events-none opacity-50")}>
        {children}
      </div>
    </div>
  );
}
