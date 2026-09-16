import Link from "next/link";
import {
  Users,
  UserCog,
  GraduationCap,
  FileText,
  Newspaper,
  Mail,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";
import { StatCard } from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AdminDashboardPage() {
  const session = await auth();
  const role = session?.user.role ?? "ADMIN";

  if (role !== "ADMIN") {
    const grants = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
    const grantedKeys = new Set(grants.map((g) => g.permission.key));
    const sections = PERMISSIONS.filter((p) => grantedKeys.has(p.key));

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {session?.user.name}</h1>
          <p className="text-sm text-muted-foreground">
            You have access to the following admin sections.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {sections.map((s) => (
            <Link
              key={s.key}
              href={`/admin/${s.key.replace("admin.", "")}`}
              className="rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-sm hover:shadow-md"
            >
              {s.label}
            </Link>
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No sections have been granted yet.
            </p>
          )}
        </div>
      </div>
    );
  }

  const [
    studentCount,
    staffCount,
    classCount,
    pageCount,
    postCount,
    unreadCount,
    recentMessages,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.class.count(),
    prisma.page.count(),
    prisma.post.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your school&apos;s students, staff, and site content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Students"
          value={studentCount}
          icon={Users}
          palette="orange"
          href="/admin/students"
        />
        <StatCard
          label="Staff"
          value={staffCount}
          icon={UserCog}
          palette="blue"
          href="/admin/staff"
        />
        <StatCard
          label="Classes"
          value={classCount}
          icon={GraduationCap}
          palette="purple"
          href="/admin/classes"
        />
        <StatCard
          label="Pages"
          value={pageCount}
          icon={FileText}
          palette="teal"
          href="/admin/pages"
        />
        <StatCard
          label="News & Events"
          value={postCount}
          icon={Newspaper}
          palette="green"
          href="/admin/posts"
        />
        <StatCard
          label="Unread Messages"
          value={unreadCount}
          icon={Mail}
          palette="sky"
          href="/admin/messages"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Messages</CardTitle>
          <Link
            href="/admin/messages"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {recentMessages.map((msg) => {
            const initials = msg.name
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <div key={msg.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{msg.name}</p>
                    {!msg.read && (
                      <Badge className="bg-primary/10 text-primary">New</Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {msg.message}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {msg.createdAt.toLocaleDateString()}
                </span>
              </div>
            );
          })}
          {recentMessages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No messages yet — they&apos;ll show up here when someone
              contacts the school through the website.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
