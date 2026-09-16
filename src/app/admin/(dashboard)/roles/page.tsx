import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ensurePermissionsSeeded,
  PERMISSIONS,
  GRANTABLE_ROLES,
} from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PermissionToggle } from "@/components/admin/PermissionToggle";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default async function AdminRolesPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");

  await ensurePermissionsSeeded();

  const [permissions, grants] = await Promise.all([
    prisma.permission.findMany({ orderBy: { label: "asc" } }),
    prisma.rolePermission.findMany({ include: { permission: true } }),
  ]);

  const grantedSet = new Set(grants.map((g) => `${g.role}:${g.permission.key}`));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Role & Access"
        description="Grant Principal, Teacher, or Staff access to specific admin sections. Admin always has full access."
      />

      <Card className="max-w-3xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission</TableHead>
              {GRANTABLE_ROLES.map((role) => (
                <TableHead key={role} className="text-center">
                  {roleLabel(role)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.label}</TableCell>
                {GRANTABLE_ROLES.map((role) => (
                  <TableCell key={role} className="text-center">
                    <PermissionToggle
                      role={role}
                      permissionKey={
                        PERMISSIONS.find((p) => p.key === permission.key)!.key
                      }
                      label={permission.label}
                      defaultChecked={grantedSet.has(`${role}:${permission.key}`)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
