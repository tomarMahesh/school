import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
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

export default async function AdminExamsPage() {
  await requirePermission("admin.exams");

  const [exams, classes] = await Promise.all([
    prisma.exam.findMany({
      include: { class: true, subjects: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Examinations"
        description="Create exams, assign subjects with max marks, and publish results."
      />

      <CreateExamForm classes={classes} />

      <Card className="max-w-3xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Class</TableHead>
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
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
