"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Award,
  Wallet,
  CalendarRange,
  UserCog,
  IdCard,
  Users,
  ChevronRight,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SchoolLogo } from "@/components/site/SchoolLogo";
import { signOutOfPortal } from "@/lib/actions/auth";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };
type NavGroup = { label: string; items: NavItem[] };

function navFor(role: string): NavGroup[] {
  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [{ href: "/portal", label: "Dashboard", icon: LayoutDashboard }],
    },
  ];

  if (role === "TEACHER" || role === "PRINCIPAL") {
    groups.push({
      label: "Teaching",
      items: [
        {
          href: "/portal/classes",
          label: role === "PRINCIPAL" ? "All Classes" : "My Classes",
          icon: GraduationCap,
        },
      ],
    });
  }

  if (role === "PRINCIPAL") {
    groups.push({
      label: "School",
      items: [
        { href: "/portal/staff", label: "Staff Directory", icon: IdCard },
        { href: "/portal/all-students", label: "All Students", icon: Users },
      ],
    });
  }

  if (role === "STUDENT") {
    groups.push(
      {
        label: "My Learning",
        items: [
          { href: "/portal/attendance", label: "Attendance", icon: ClipboardCheck },
          { href: "/portal/grades", label: "Grades", icon: BookOpen },
          { href: "/portal/results", label: "Results", icon: Award },
          { href: "/portal/exams", label: "Scheduled Exams", icon: CalendarRange },
        ],
      },
      {
        label: "Fees",
        items: [{ href: "/portal/fees", label: "My Fees", icon: Wallet }],
      },
    );
  }

  groups.push({
    label: "Account",
    items: [{ href: "/portal/account", label: "My Account", icon: UserCog }],
  });

  return groups;
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function PortalSidebar({
  userName,
  userRole,
  logoUrl,
}: {
  userName: string;
  userRole: string;
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/portal" className="flex items-center gap-2 px-2 py-1">
          <SchoolLogo className="h-8 w-8 shrink-0" src={logoUrl} />
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            {roleLabel(userRole)} Portal
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navFor(userRole).map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/portal"
                      ? pathname === "/portal"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={isActive}
                        tooltip={item.label}
                        className="data-active:bg-primary! data-active:text-primary-foreground! data-active:font-medium data-active:[&_svg]:text-primary-foreground!"
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg bg-sidebar-accent p-2 text-left hover:opacity-90">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabel(userRole)}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={signOutOfPortal}>
              <DropdownMenuItem
                variant="destructive"
                nativeButton
                render={<button type="submit" className="w-full" />}
              >
                <LogOut />
                Sign out
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
