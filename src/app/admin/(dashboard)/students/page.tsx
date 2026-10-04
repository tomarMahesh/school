import { UserPlus, Upload, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";
import { deleteStudent } from "@/lib/actions/students";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { StudentFilters } from "@/components/admin/StudentFilters";
import { EmailStatusBanner } from "@/components/admin/EmailStatusBanner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Gender } from "@/generated/prisma/enums";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminStudentsPage(
  props: PageProps<"/admin/students">,
) {
  const searchParams = await props.searchParams;

  const currentYear = await getCurrentAcademicYear();
  const academicYears = await prisma.academicYear.findMany({
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  });

  const yearParam = typeof searchParams.year === "string" ? searchParams.year : undefined;
  const selectedYearId = yearParam === "all" ? undefined : (yearParam ?? currentYear?.id);
  const classId = typeof searchParams.classId === "string" ? searchParams.classId : "";
  const streamId = typeof searchParams.streamId === "string" ? searchParams.streamId : "";
  const gender = typeof searchParams.gender === "string" ? searchParams.gender : "";

  const hasFilters = Boolean(yearParam || classId || streamId || gender);
  const emailStatus = typeof searchParams.emailStatus === "string" ? searchParams.emailStatus : undefined;
  const createdName = typeof searchParams.name === "string" ? searchParams.name : "";

  const [classes, streams, students] = await Promise.all([
    prisma.class.findMany({
      where: selectedYearId ? { academicYearId: selectedYearId } : {},
      orderBy: { name: "asc" },
    }),
    prisma.stream.findMany({ orderBy: { name: "asc" } }),
    prisma.student.findMany({
      where: {
        ...(classId
          ? { classId }
          : selectedYearId
            ? { class: { academicYearId: selectedYearId } }
            : {}),
        ...(streamId ? { streamId } : {}),
        ...(gender ? { gender: gender as Gender } : {}),
      },
      include: {
        user: true,
        class: { include: { academicYear: true } },
        stream: true,
      },
      orderBy: { user: { name: "asc" } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Students"
        description={`${students.length} student${students.length === 1 ? "" : "s"} enrolled`}
        action={
          <div className="flex gap-2">
            <LinkButton href="/admin/students/import" variant="outline">
              <Upload />
              Import Students
            </LinkButton>
            <LinkButton href="/admin/students/new">
              <UserPlus />
              Admit Student
            </LinkButton>
          </div>
        }
      />

      <EmailStatusBanner status={emailStatus} name={createdName} />

      <StudentFilters academicYears={academicYears} classes={classes} streams={streams}>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Class</TableHead>
                {!selectedYearId && <TableHead>Academic Year</TableHead>}
                <TableHead>Stream</TableHead>
                <TableHead>Father&apos;s Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                          {initialsOf(student.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{student.user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.user.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.gender ? GENDER_LABELS[student.gender] : "—"}
                  </TableCell>
                  <TableCell>
                    {student.class ? (
                      <Badge variant="secondary">{student.class.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  {!selectedYearId && (
                    <TableCell className="text-muted-foreground">
                      {student.class?.academicYear.name ?? "—"}
                    </TableCell>
                  )}
                  <TableCell className="text-muted-foreground">
                    {student.stream?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.fatherName ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <LinkButton
                        href={`/admin/students/${student.id}`}
                        variant="ghost"
                        size="icon"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </LinkButton>
                      <DeleteAlertButton
                        action={deleteStudent.bind(null, student.id)}
                        itemLabel={student.user.name}
                        successMessage="Student removed."
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={selectedYearId ? 7 : 8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {hasFilters
                      ? "No students match those filters."
                      : 'No students yet. Click "Admit Student" to add one.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </StudentFilters>
    </div>
  );
}
