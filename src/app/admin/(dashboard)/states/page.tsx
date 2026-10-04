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

export default async function AdminStatesPage() {
  const states = await prisma.state.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="States"
        description={`${states.length} state${states.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/states/new">
            <Plus />
            New State
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
            {states.map((state) => (
              <TableRow key={state.id}>
                <TableCell className="font-medium">{state.name}</TableCell>
                <TableCell className="text-right">
                  <LinkButton
                    href={`/admin/states/${state.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {states.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                  No states yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
