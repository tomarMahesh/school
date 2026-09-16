import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS } from "@/lib/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user.role ?? "ADMIN";

  const [unreadMessages, grants] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false } }),
    role === "ADMIN"
      ? Promise.resolve([])
      : prisma.rolePermission.findMany({
          where: { role },
          include: { permission: true },
        }),
  ]);

  const grantedKeys =
    role === "ADMIN"
      ? PERMISSIONS.map((p) => p.key)
      : grants.map((g) => g.permission.key);

  return (
    <SidebarProvider className="admin-theme">
      <AdminSidebar
        unreadMessages={unreadMessages}
        userName={session?.user.name ?? "Admin"}
        userRole={role}
        grantedKeys={grantedKeys}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium text-muted-foreground">
              School Portal Admin
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            nativeButton={false}
            render={<Link href="/admin/messages" aria-label="Messages" />}
          >
            <Bell className="h-5 w-5" />
            {unreadMessages > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            )}
          </Button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
