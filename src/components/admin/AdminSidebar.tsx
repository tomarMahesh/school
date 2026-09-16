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
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SchoolLogo } from "@/components/site/SchoolLogo";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/posts", label: "News & Events", icon: Newspaper },
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
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/students", label: "Students", icon: Users },
      { href: "/admin/staff", label: "Staff", icon: UserCog },
    ],
  },
] as const;

export function AdminSidebar({ unreadMessages }: { unreadMessages: number }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
          <SchoolLogo className="h-8 w-8 shrink-0" />
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Admin Panel
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
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
    </Sidebar>
  );
}
