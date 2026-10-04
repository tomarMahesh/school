import Link from "next/link";
import {
  ClipboardCheck,
  Wallet,
  CalendarRange,
  GraduationCap,
  Users,
  IdCard,
  BookOpen,
  Award,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";
import { summarize } from "@/lib/attendanceReport";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";

type Stat = { label: string; value: string; hint?: string; icon: typeof Users };

function StatCard({ stat }: { stat: Stat }) {
  return (
    <Card className="flex-row items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <stat.icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="truncate text-2xl font-bold">{stat.value}</p>
        {stat.hint && <p className="truncate text-xs text-muted-foreground">{stat.hint}</p>}
      </div>
    </Card>
  );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof Users }) {
  return (
    <Link href={href}>
      <Card className="flex-row items-center gap-3 p-4 transition hover:bg-muted/50">
        <Icon className="h-5 w-5 text-primary" />
        <span className="flex-1 text-sm font-medium">{label}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </Card>
    </Link>
  );
}

function money(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

async function studentView(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { class: true },
  });
  if (!student) {
    return {
      description: "Your student profile hasn't been set up yet.",
      stats: [] as Stat[],
      links: [],
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [attendance, nextExam, structures, payments] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId: student.id },
      select: { status: true },
    }),
    student.classId
      ? prisma.exam.findFirst({
          where: { classId: student.classId, published: true, examDate: { gte: today } },
          orderBy: { examDate: "asc" },
        })
      : null,
    student.classId
      ? prisma.feeStructure.aggregate({
          where: { classId: student.classId },
          _sum: { amount: true },
        })
      : null,
    prisma.feePayment.aggregate({
      where: { studentId: student.id },
      _sum: { amount: true },
    }),
  ]);

  const att = summarize(attendance.map((a) => a.status));
  const due = structures?._sum.amount ?? 0;
  const paid = payments._sum.amount ?? 0;

  const stats: Stat[] = [
    {
      label: "Attendance",
      value: att.pct === null ? "—" : `${att.pct}%`,
      hint: att.total > 0 ? `${att.present} present of ${att.total} days` : "No days marked yet",
      icon: ClipboardCheck,
    },
    {
      label: "Fee balance",
      value: due > 0 ? money(Math.max(0, due - paid)) : "—",
      hint: due > 0 ? `${money(paid)} paid of ${money(due)}` : "No fee structure set",
      icon: Wallet,
    },
    {
      label: "Next exam",
      value: nextExam?.examDate
        ? nextExam.examDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        : "—",
      hint: nextExam ? nextExam.name : "Nothing scheduled",
      icon: CalendarRange,
    },
  ];

  return {
    description: student.class ? `Class ${student.class.name}` : "No class assigned yet",
    stats,
    links: [
      { href: "/portal/attendance", label: "My attendance", icon: ClipboardCheck },
      { href: "/portal/grades", label: "My grades", icon: BookOpen },
      { href: "/portal/results", label: "My results", icon: Award },
      { href: "/portal/fees", label: "My fees", icon: Wallet },
      { href: "/portal/exams", label: "Scheduled exams", icon: CalendarRange },
    ],
  };
}

async function staffView(userId: string, role: string) {
  const year = await getCurrentAcademicYear();
  const classWhere = year ? { academicYearId: year.id } : {};

  if (role === "PRINCIPAL") {
    const [classes, students, staff] = await Promise.all([
      prisma.class.count({ where: classWhere }),
      prisma.student.count(),
      prisma.staff.count(),
    ]);
    return {
      description: "School overview",
      stats: [
        { label: "Classes", value: String(classes), icon: GraduationCap },
        { label: "Students", value: String(students), icon: Users },
        { label: "Staff", value: String(staff), icon: IdCard },
      ] as Stat[],
      links: [
        { href: "/portal/classes", label: "All classes", icon: GraduationCap },
        { href: "/portal/all-students", label: "All students", icon: Users },
        { href: "/portal/staff", label: "Staff directory", icon: IdCard },
      ],
    };
  }

  if (role === "TEACHER") {
    const classes = await prisma.class.findMany({
      where: { ...classWhere, teacher: { userId } },
      include: { _count: { select: { students: true } } },
    });
    const studentCount = classes.reduce((n, c) => n + c._count.students, 0);
    return {
      description: "Teaching overview",
      stats: [
        { label: "My classes", value: String(classes.length), icon: GraduationCap },
        { label: "My students", value: String(studentCount), icon: Users },
      ] as Stat[],
      links: [{ href: "/portal/classes", label: "My classes", icon: GraduationCap }],
    };
  }

  return { description: "Welcome to the staff portal", stats: [] as Stat[], links: [] };
}

export default async function PortalDashboardPage() {
  const session = await auth();
  const role = session?.user.role ?? "STUDENT";
  const userId = session?.user.id ?? "";

  const view = role === "STUDENT" ? await studentView(userId) : await staffView(userId, role);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={`Welcome, ${session?.user.name ?? ""}`} description={view.description} />

      {view.stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {view.stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>
      )}

      {view.links.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick links</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {view.links.map((link) => (
              <QuickLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
