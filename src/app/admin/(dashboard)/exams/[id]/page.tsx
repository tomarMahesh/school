import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { removeExamSubject, deleteExam } from "@/lib/actions/exams";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExamSubjectForm } from "@/components/admin/ExamSubjectForm";
import { PublishExamToggle } from "@/components/admin/PublishExamToggle";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ManageExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("admin.exams");
  const { id } = await params;

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      class: { include: { students: true } },
      subjects: { include: { subject: true, marks: true } },
    },
  });
  if (!exam) notFound();

  const allSubjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  const assignedIds = new Set(exam.subjects.map((es) => es.subjectId));
  const availableSubjects = allSubjects.filter((s) => !assignedIds.has(s.id));
  const studentCount = exam.class.students.length;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={exam.name}
        description={`${exam.class.name} · ${exam.term}${exam.examDate ? ` · ${exam.examDate.toLocaleDateString()}` : ""}`}
        action={
          <DeleteAlertButton
            action={deleteExam.bind(null, exam.id)}
            itemLabel={exam.name}
            successMessage="Exam deleted."
          />
        }
      />

      <Card className="max-w-lg p-4">
        <PublishExamToggle examId={exam.id} defaultChecked={exam.published} />
      </Card>

      {availableSubjects.length > 0 && (
        <Card className="max-w-lg p-4">
          <ExamSubjectForm examId={exam.id} subjects={availableSubjects} />
        </Card>
      )}

      <Card className="max-w-2xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Max Marks</TableHead>
              <TableHead>Marks Entered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exam.subjects.map((es) => (
              <TableRow key={es.id}>
                <TableCell className="font-medium">{es.subject.name}</TableCell>
                <TableCell>{es.maxMarks}</TableCell>
                <TableCell className="text-muted-foreground">
                  {es.marks.length} / {studentCount}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteAlertButton
                    action={removeExamSubject.bind(null, es.id, exam.id)}
                    itemLabel={`${es.subject.name} from this exam`}
                    successMessage="Subject removed."
                  />
                </TableCell>
              </TableRow>
            ))}
            {exam.subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No subjects added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
