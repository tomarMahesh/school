import Link from "next/link";
import { auth } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);
  const role = session?.user.role ?? "STUDENT";
  const roleName = role.charAt(0) + role.slice(1).toLowerCase();

  return (
    <SidebarProvider className="admin-theme portal-shell">
      <PortalSidebar
        userName={session?.user.name ?? "User"}
        userRole={role}
        logoUrl={settings.logoUrl}
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 print:hidden">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm font-medium text-muted-foreground">
              {settings.schoolName} · {roleName} Portal
            </span>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Visit website
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
