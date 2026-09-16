import { Plus, Pencil } from "lucide-react";
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

export default async function AdminClassesPage() {
  const classes = await prisma.class.findMany({
    include: { teacher: { include: { user: true } }, _count: { select: { students: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Classes"
        description={`${classes.length} class${classes.length === 1 ? "" : "es"}`}
        action={
          <LinkButton href="/admin/classes/new">
            <Plus />
            New Class
          </LinkButton>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((klass) => (
              <TableRow key={klass.id}>
                <TableCell className="font-medium">{klass.name}</TableCell>
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
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
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
