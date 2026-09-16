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

export default async function AdminStreamsPage() {
  const streams = await prisma.stream.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Streams"
        description={`${streams.length} stream${streams.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/streams/new">
            <Plus />
            New Stream
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
            {streams.map((stream) => (
              <TableRow key={stream.id}>
                <TableCell className="font-medium">{stream.name}</TableCell>
                <TableCell className="text-right">
                  <LinkButton
                    href={`/admin/streams/${stream.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {streams.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="py-10 text-center text-muted-foreground">
                  No streams yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
