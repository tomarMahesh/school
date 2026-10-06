"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Mail,
  GraduationCap,
  Route,
  BookOpen,
  Layers,
  CalendarRange,
  Users,
  UserCog,
  ChevronRight,
  LogOut,
  ClipboardCheck,
  NotebookPen,
  Wallet,
  PartyPopper,
  Award,
  ShieldCheck,
  Settings as SettingsIcon,
  Map,
  Landmark,
  Hash,
  IdCard,
  BadgeCheck,
  Images,
  LayoutTemplate,
  History,
} from "lucide-react";
import type { PermissionKey } from "@/lib/permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
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
import { signOutOfAdmin } from "@/lib/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionKey;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/content", label: "Site Pages", icon: LayoutTemplate },
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/posts", label: "News & Events", icon: Newspaper },
      { href: "/admin/gallery", label: "Gallery", icon: Images },
      { href: "/admin/messages", label: "Messages", icon: Mail },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/admin/classes", label: "Classes", icon: GraduationCap },
      { href: "/admin/streams", label: "Streams", icon: Route },
      { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
      { href: "/admin/sections", label: "Sections", icon: Layers },
      { href: "/admin/academic-years", label: "Academic Years", icon: CalendarRange },
      {
        href: "/admin/exams",
        label: "Examinations",
        icon: NotebookPen,
        permission: "admin.exams",
      },
      // No `permission` here on purpose: attendance is admin + class-teacher
      // only, not grantable, so only ADMIN sees this link (see canSee below).
      { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/students", label: "Students", icon: Users },
      { href: "/admin/staff", label: "Staff", icon: UserCog },
    ],
  },
  {
    label: "Staff Masters",
    items: [
      { href: "/admin/portal-roles", label: "Portal Roles", icon: IdCard },
      { href: "/admin/qualifications", label: "Qualifications", icon: BadgeCheck },
    ],
  },
  {
    label: "Address Masters",
    items: [
      { href: "/admin/states", label: "States", icon: Map },
      { href: "/admin/districts", label: "Districts", icon: Landmark },
      { href: "/admin/pincodes", label: "Pincodes", icon: Hash },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/admin/fees",
        label: "Fees Collection",
        icon: Wallet,
        permission: "admin.fees",
      },
      {
        href: "/admin/holidays",
        label: "Holidays",
        icon: PartyPopper,
        permission: "admin.holidays",
      },
      {
        href: "/admin/certificates",
        label: "Certificates",
        icon: Award,
        permission: "admin.certificates",
      },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/roles", label: "Role & Access", icon: ShieldCheck },
      // No `permission`: only ADMIN sees the audit trail, and it is not grantable.
      { href: "/admin/audit-log", label: "Audit Log", icon: History },
      {
        href: "/admin/settings",
        label: "Settings",
        icon: SettingsIcon,
        permission: "admin.settings",
      },
    ],
  },
];

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function AdminSidebar({
  unreadMessages,
  userName,
  userRole,
  grantedKeys,
  logoUrl,
}: {
  unreadMessages: number;
  userName: string;
  userRole: string;
  grantedKeys: string[];
  logoUrl?: string | null;
}) {
  const pathname = usePathname();
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const canSee = (item: NavItem) =>
    userRole === "ADMIN" ||
    (item.permission ? grantedKeys.includes(item.permission) : false);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(canSee),
  })).filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
          <SchoolLogo className="h-8 w-8 shrink-0" src={logoUrl} />
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Admin Panel
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
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
                      {item.href === "/admin/messages" && unreadMessages > 0 && (
                        <SidebarMenuBadge>{unreadMessages}</SidebarMenuBadge>
                      )}
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
            <form action={signOutOfAdmin}>
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
