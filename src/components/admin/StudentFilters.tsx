"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "cn";
import { LinkButton } from "@/components/admin/LinkButton";

export function StudentFilters({
  academicYears,
  classes,
  streams,
  children,
}: {
  academicYears: { id: string; name: string; isCurrent: boolean }[];
  classes: { id: string; name: string }[];
  streams: { id: string; name: string }[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const yearValue = searchParams.get("year") ?? "";
  const classValue = searchParams.get("classId") ?? "";
  const streamValue = searchParams.get("streamId") ?? "";
  const genderValue = searchParams.get("gender") ?? "";
  const hasFilters = Boolean(yearValue || classValue || streamValue || genderValue);

  function setParam(key: string, value: string, alsoClear: string[] = []) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    for (const k of alsoClear) params.delete(k);

    startTransition(() => {
      router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Academic Year
          <select
            value={yearValue || (academicYears.find((y) => y.isCurrent)?.id ?? "all")}
            onChange={(e) => setParam("year", e.target.value, ["classId"])}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
                {y.isCurrent ? " (current)" : ""}
              </option>
            ))}
            <option value="all">All years</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Class
          <select
            value={classValue}
            onChange={(e) => setParam("classId", e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Stream
          <select
            value={streamValue}
            onChange={(e) => setParam("streamId", e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All streams</option>
            {streams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Gender
          <select
            value={genderValue}
            onChange={(e) => setParam("gender", e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </label>

        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Loading" />
        )}

        {hasFilters && (
          <LinkButton href={pathname} variant="ghost">
            Clear filters
          </LinkButton>
        )}
      </div>

      <div className={cn("transition-opacity", isPending && "pointer-events-none opacity-50")}>
        {children}
      </div>
    </div>
  );
}
