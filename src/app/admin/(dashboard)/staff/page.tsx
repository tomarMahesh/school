import { UserPlus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteStaff } from "@/lib/actions/staff";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { EmailStatusBanner } from "@/components/admin/EmailStatusBanner";
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

const ROLE_BADGE: Record<string, string> = {
  PRINCIPAL: "bg-purple-100 text-purple-700",
  TEACHER: "bg-blue-100 text-blue-700",
  STAFF: "bg-slate-100 text-slate-700",
};

export default async function AdminStaffPage(props: PageProps<"/admin/staff">) {
  const searchParams = await props.searchParams;
  const emailStatus = typeof searchParams.emailStatus === "string" ? searchParams.emailStatus : undefined;
  const createdName = typeof searchParams.name === "string" ? searchParams.name : "";

  const staff = await prisma.staff.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Staff"
        description={`${staff.length} staff member${staff.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/staff/new">
            <UserPlus />
            Onboard Staff
          </LinkButton>
        }
      />

      <EmailStatusBanner status={emailStatus} name={createdName} />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {initialsOf(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{member.designation}</TableCell>
                <TableCell>
                  <Badge className={ROLE_BADGE[member.user.role] ?? ""}>
                    {member.user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.user.email}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <LinkButton
                      href={`/admin/staff/${member.id}`}
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </LinkButton>
                    <DeleteAlertButton
                      action={deleteStaff.bind(null, member.id)}
                      itemLabel={member.user.name}
                      successMessage="Staff member removed."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No staff yet. Click &quot;Onboard Staff&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
