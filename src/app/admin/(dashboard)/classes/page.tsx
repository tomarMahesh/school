import { Plus, Pencil, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
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

export default async function AdminClassesPage(props: PageProps<"/admin/classes">) {
  const searchParams = await props.searchParams;
  const academicYears = await prisma.academicYear.findMany({
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  });
  const currentYear = academicYears.find((y) => y.isCurrent) ?? academicYears[0];

  const yearParam = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const selectedYearId = yearParam === "all" ? undefined : (yearParam ?? currentYear?.id);

  const classes = await prisma.class.findMany({
    where: selectedYearId ? { academicYearId: selectedYearId } : {},
    include: {
      teacher: { include: { user: true } },
      academicYear: true,
      _count: { select: { students: true } },
    },
    orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Classes"
        description={`${classes.length} class${classes.length === 1 ? "" : "es"}`}
        action={
          <div className="flex gap-2">
            <LinkButton href="/admin/classes/promote" variant="outline">
              <ArrowUpRight />
              Promote Students
            </LinkButton>
            <LinkButton href="/admin/classes/new">
              <Plus />
              New Class
            </LinkButton>
          </div>
        }
      />

      <form method="get" className="flex items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Academic Year
          <select
            name="year"
            defaultValue={yearParam ?? currentYear?.id ?? "all"}
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
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
        >
          View
        </button>
      </form>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              {!selectedYearId && <TableHead>Academic Year</TableHead>}
              <TableHead>Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((klass) => (
              <TableRow key={klass.id}>
                <TableCell className="font-medium">{klass.name}</TableCell>
                {!selectedYearId && (
                  <TableCell>
                    <Badge variant="secondary">{klass.academicYear.name}</Badge>
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">
                  {klass.teacher?.user.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{klass._count.students}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <LinkButton
                    href={`/admin/classes/${klass.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={selectedYearId ? 4 : 5} className="py-10 text-center text-muted-foreground">
                  No classes yet. Click &quot;New Class&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
