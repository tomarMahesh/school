import { prisma } from "@/lib/prisma";
import { createSubject, deleteSubject } from "@/lib/actions/masters";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Subjects"
        description={`${subjects.length} subject${subjects.length === 1 ? "" : "s"}`}
      />

      <InlineCreateForm action={createSubject} submitLabel="Add Subject">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Mathematics" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Code (optional)</Label>
          <Input id="code" name="code" placeholder="MATH" className="w-28" />
        </div>
      </InlineCreateForm>

      <Card className="max-w-md p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.code ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <DeleteAlertButton
                    action={deleteSubject.bind(null, s.id)}
                    itemLabel={s.name}
                    successMessage="Subject deleted."
                  />
                </TableCell>
              </TableRow>
            ))}
            {subjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No subjects yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
