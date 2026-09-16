"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setRolePermission } from "@/lib/actions/permissions";
import type { PermissionKey } from "@/lib/permissions";
import type { Role } from "@/generated/prisma/enums";

export function PermissionToggle({
  role,
  permissionKey,
  label,
  defaultChecked,
}: {
  role: Role;
  permissionKey: PermissionKey;
  label: string;
  defaultChecked: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      aria-label={label}
      defaultChecked={defaultChecked}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await setRolePermission(role, permissionKey, checked);
          toast.success(
            `${checked ? "Granted" : "Revoked"} "${label}" for ${role.charAt(0) + role.slice(1).toLowerCase()}.`,
          );
        });
      }}
    />
  );
}
