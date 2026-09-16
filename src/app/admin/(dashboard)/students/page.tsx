import { UserPlus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteStudent } from "@/lib/actions/students";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
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

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Students"
        description={`${students.length} student${students.length === 1 ? "" : "s"} enrolled`}
        action={
          <LinkButton href="/admin/students/new">
            <UserPlus />
            Admit Student
          </LinkButton>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Class</TableHead>
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
                <TableCell>
                  {student.class ? (
                    <Badge variant="secondary">{student.class.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
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
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No students yet. Click &quot;Admit Student&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
