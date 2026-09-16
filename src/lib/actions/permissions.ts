"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GRANTABLE_ROLES, type PermissionKey } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/enums";

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function setRolePermission(
  role: Role,
  permissionKey: PermissionKey,
  granted: boolean,
) {
  await requireAdmin();
  if (!GRANTABLE_ROLES.includes(role)) throw new Error("Role is not grantable");

  const permission = await prisma.permission.findUniqueOrThrow({
    where: { key: permissionKey },
  });

  if (granted) {
    await prisma.rolePermission.upsert({
      where: { role_permissionId: { role, permissionId: permission.id } },
      update: {},
      create: { role, permissionId: permission.id },
    });
  } else {
    await prisma.rolePermission.deleteMany({
      where: { role, permissionId: permission.id },
    });
  }

  revalidatePath("/admin/roles");
}
