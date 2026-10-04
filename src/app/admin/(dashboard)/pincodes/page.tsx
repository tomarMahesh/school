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

export default async function AdminPincodesPage() {
  const pincodes = await prisma.pincode.findMany({
    include: { district: { include: { state: true } } },
    orderBy: [{ code: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pincodes"
        description={`${pincodes.length} pincode${pincodes.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/pincodes/new">
            <Plus />
            New Pincode
          </LinkButton>
        }
      />

      <Card className="max-w-lg p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pincode</TableHead>
              <TableHead>District</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pincodes.map((pincode) => (
              <TableRow key={pincode.id}>
                <TableCell className="font-mono font-medium">{pincode.code}</TableCell>
                <TableCell className="text-muted-foreground">
                  {pincode.district.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{pincode.district.state.name}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <LinkButton
                    href={`/admin/pincodes/${pincode.id}`}
                    variant="ghost"
                    size="icon"
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </LinkButton>
                </TableCell>
              </TableRow>
            ))}
            {pincodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No pincodes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
