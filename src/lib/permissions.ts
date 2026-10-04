import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Role } from "@/generated/prisma/enums";

// Catalog of grantable permissions -- keep in sync with the admin
// sections that check requirePermission(). ADMIN always has every
// permission implicitly (checked in code, not stored) so it can't be
// revoked by a bad Role & Access edit.
export const PERMISSIONS = [
  { key: "admin.holidays", label: "Manage Holidays" },
  { key: "admin.settings", label: "Manage Site Settings" },
  { key: "admin.fees", label: "Manage Fees" },
  { key: "admin.exams", label: "Manage Examinations" },
  { key: "admin.certificates", label: "Issue Certificates" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

const GRANTABLE_ROLES: Role[] = ["PRINCIPAL", "TEACHER", "STAFF"];

export async function ensurePermissionsSeeded() {
  await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({
        where: { key: p.key },
        update: { label: p.label },
        create: { key: p.key, label: p.label },
      }),
    ),
  );
}

export async function hasPermission(role: Role, key: PermissionKey) {
  if (role === "ADMIN") return true;
  const grant = await prisma.rolePermission.findFirst({
    where: { role, permission: { key } },
  });
  return Boolean(grant);
}

/** True if the role has been granted at least one admin permission. */
export async function hasAnyPermission(role: Role) {
  if (role === "ADMIN") return true;
  const grant = await prisma.rolePermission.findFirst({ where: { role } });
  return Boolean(grant);
}

/** Throws if the current session lacks `key`. ADMIN always passes. */
export async function requirePermission(key: PermissionKey) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  const ok = await hasPermission(session.user.role, key);
  if (!ok) throw new Error("Unauthorized");
  return session;
}

export { GRANTABLE_ROLES };
