import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PromoteForm } from "@/components/admin/PromoteForm";

export default async function PromoteClassesPage(
  props: PageProps<"/admin/classes/promote">,
) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");

  const searchParams = await props.searchParams;
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
  });

  if (academicYears.length < 2) {
    return (
      <div className="flex flex-col gap-4">
        <AdminPageHeader title="Promote Students" />
        <p className="max-w-lg text-sm text-muted-foreground">
          You need at least two academic years to promote students between
          them.{" "}
          <Link href="/admin/academic-years" className="underline">
            Add a new academic year
          </Link>{" "}
          first.
        </p>
      </div>
    );
  }

  const currentYear = academicYears.find((y) => y.isCurrent) ?? academicYears[0];
  const fromYearId =
    typeof searchParams.from === "string" ? searchParams.from : currentYear.id;
  const toYearId =
    typeof searchParams.to === "string"
      ? searchParams.to
      : academicYears.find((y) => y.id !== fromYearId)?.id;

  const sourceClasses = fromYearId
    ? await prisma.class.findMany({
        where: { academicYearId: fromYearId },
        include: { _count: { select: { students: true } } },
        orderBy: { name: "asc" },
      })
    : [];

  const toYear = academicYears.find((y) => y.id === toYearId);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Promote Students"
        description="Move students from one academic year's classes into the next."
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          From Year
          <select
            name="from"
            defaultValue={fromYearId}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          To Year
          <select
            name="to"
            defaultValue={toYearId}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Load Classes
        </button>
      </form>

      {toYear && fromYearId !== toYearId && (
        <PromoteForm
          fromYearId={fromYearId}
          toYearId={toYear.id}
          toYearName={toYear.name}
          classes={sourceClasses.map((c) => ({
            id: c.id,
            name: c.name,
            studentCount: c._count.students,
          }))}
        />
      )}
      {fromYearId === toYearId && (
        <p className="text-sm text-destructive">
          From and To year must be different.
        </p>
      )}
    </div>
  );
}
