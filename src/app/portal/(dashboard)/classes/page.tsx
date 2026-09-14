import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherClassesPage() {
  const session = await auth();
  const role = session?.user.role;
  if (role !== "TEACHER" && role !== "PRINCIPAL") redirect("/portal");

  let classes: { id: string; name: string; studentCount: number; teacherName: string | null }[];

  if (role === "PRINCIPAL") {
    const all = await prisma.class.findMany({
      include: {
        teacher: { include: { user: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    });
    classes = all.map((klass) => ({
      id: klass.id,
      name: klass.name,
      studentCount: klass._count.students,
      teacherName: klass.teacher?.user.name ?? null,
    }));
  } else {
    const staff = await prisma.staff.findUnique({
      where: { userId: session!.user.id },
      include: {
        classes: { include: { _count: { select: { students: true } } } },
      },
    });
    classes = (staff?.classes ?? []).map((klass) => ({
      id: klass.id,
      name: klass.name,
      studentCount: klass._count.students,
      teacherName: null,
    }));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {role === "PRINCIPAL" ? "All Classes" : "My Classes"}
      </h1>
      <ul className="mt-6 flex flex-col gap-3">
        {classes.map((klass) => (
          <li key={klass.id}>
            <Link href={`/portal/classes/${klass.id}`} className="underline">
              {klass.name}
            </Link>{" "}
            <span className="text-sm opacity-60">
              ({klass.studentCount} students
              {klass.teacherName ? ` · ${klass.teacherName}` : ""})
            </span>
          </li>
        ))}
        {classes.length === 0 && <p className="opacity-60">No classes yet.</p>}
      </ul>
    </div>
  );
}
