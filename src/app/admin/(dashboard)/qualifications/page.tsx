import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminQualificationsPage() {
  const qualifications = await prisma.qualification.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Qualifications"
        description={`${qualifications.length} qualification${qualifications.length === 1 ? "" : "s"} -- used as the Qualification options on the Staff form`}
        action={
          <LinkButton href="/admin/qualifications/new">
            <Plus />
            New Qualification
          </LinkButton>
        }
      />

      <Card className="max-w-md p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {qualifications.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium">{q.name}</TableCell>
                <TableCell className="text-right">
                  <LinkButton
                    href={`/admin/qualifications/${q.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {qualifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                  No qualifications yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
