import { prisma } from "@/lib/prisma";
import { createSection, deleteSection } from "@/lib/actions/masters";
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

export default async function AdminSectionsPage() {
  const sections = await prisma.section.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Sections"
        description={`${sections.length} section${sections.length === 1 ? "" : "s"}`}
      />

      <InlineCreateForm action={createSection} submitLabel="Add Section">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="A" className="w-28" />
        </div>
      </InlineCreateForm>

      <Card className="max-w-xs p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell className="text-right">
                  <DeleteAlertButton
                    action={deleteSection.bind(null, s.id)}
                    itemLabel={`Section ${s.name}`}
                    successMessage="Section deleted."
                  />
                </TableCell>
              </TableRow>
            ))}
            {sections.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                  No sections yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
