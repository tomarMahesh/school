import { PartyPopper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { createHoliday, deleteHoliday } from "@/lib/actions/holidays";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default async function AdminHolidaysPage() {
  await requirePermission("admin.holidays");
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Holidays"
        description={`${holidays.length} holiday${holidays.length === 1 ? "" : "s"}`}
      />

      <InlineCreateForm action={createHoliday} submitLabel="Add Holiday">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Diwali" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" required />
        </div>
      </InlineCreateForm>

      <Card className="max-w-md p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidays.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-muted-foreground" />
                    {h.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {h.date.toLocaleDateString()}
                  {h.date < today && (
                    <Badge variant="secondary" className="ml-2">
                      Past
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteAlertButton
                    action={deleteHoliday.bind(null, h.id)}
                    itemLabel={h.name}
                    successMessage="Holiday deleted."
                  />
                </TableCell>
              </TableRow>
            ))}
            {holidays.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No holidays yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
