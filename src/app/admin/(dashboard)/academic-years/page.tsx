import { prisma } from "@/lib/prisma";
import {
  createAcademicYear,
  deleteAcademicYear,
  setCurrentAcademicYear,
} from "@/lib/actions/masters";
import { InlineCreateForm } from "@/components/admin/InlineCreateForm";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

export default async function AdminAcademicYearsPage() {
  const years = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Academic Years"
        description={`${years.length} academic year${years.length === 1 ? "" : "s"}`}
      />

      <InlineCreateForm action={createAcademicYear} submitLabel="Add Year">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="2026-2027" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
      </InlineCreateForm>

      <Card className="max-w-2xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id}>
                <TableCell className="font-medium">{year.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {year.startDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {year.endDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {year.isCurrent ? (
                    <Badge className="bg-primary/10 text-primary">Current</Badge>
                  ) : (
                    <form action={setCurrentAcademicYear.bind(null, year.id)}>
                      <Button type="submit" variant="outline" size="sm">
                        Set as current
                      </Button>
                    </form>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DeleteAlertButton
                    action={deleteAcademicYear.bind(null, year.id)}
                    itemLabel={year.name}
                    successMessage="Academic year deleted."
                  />
                </TableCell>
              </TableRow>
            ))}
            {years.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No academic years yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
