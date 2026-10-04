import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreateExamForm } from "@/components/admin/CreateExamForm";
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

export default async function AdminExamsPage(props: PageProps<"/admin/exams">) {
  await requirePermission("admin.exams");
  const searchParams = await props.searchParams;

  const currentYear = await getCurrentAcademicYear();
  const academicYears = await prisma.academicYear.findMany({
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  });

  const yearParam = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const selectedYearId = yearParam === "all" ? undefined : (yearParam ?? currentYear?.id);

  const [exams, classes] = await Promise.all([
    prisma.exam.findMany({
      where: selectedYearId ? { class: { academicYearId: selectedYearId } } : {},
      include: { class: { include: { academicYear: true } }, subjects: true },
      orderBy: [{ class: { academicYear: { startDate: "desc" } } }, { createdAt: "desc" }],
    }),
    prisma.class.findMany({
      where: currentYear ? { academicYearId: currentYear.id } : {},
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Examinations"
        description="Create exams, assign subjects with max marks, and publish results."
      />

      <div>
        <CreateExamForm classes={classes} />
        <p className="mt-2 max-w-lg text-xs text-muted-foreground">
          Exams can only be scheduled against {currentYear?.name ?? "the current academic year"}
          &apos;s classes, and the exam date cannot be in the past.
        </p>
      </div>

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

      <Card className="max-w-3xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Class</TableHead>
              {!selectedYearId && <TableHead>Academic Year</TableHead>}
              <TableHead>Term</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.name}</TableCell>
                <TableCell className="text-muted-foreground">{exam.class.name}</TableCell>
                {!selectedYearId && (
                  <TableCell>
                    <Badge variant="secondary">{exam.class.academicYear.name}</Badge>
                  </TableCell>
                )}
                <TableCell>{exam.term}</TableCell>
                <TableCell>{exam.subjects.length}</TableCell>
                <TableCell>
                  {exam.published ? (
                    <Badge className="bg-primary/10 text-primary">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <LinkButton href={`/admin/exams/${exam.id}`} variant="outline" size="sm">
                    Manage
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {exams.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={selectedYearId ? 6 : 7}
                  className="py-10 text-center text-muted-foreground"
                >
                  No exams yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
