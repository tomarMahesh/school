import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TeacherClassesPage() {
  const session = await auth();
  if (session?.user.role !== "TEACHER") redirect("/portal");

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: { classes: { include: { _count: { select: { students: true } } } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">My Classes</h1>
      <ul className="mt-6 flex flex-col gap-3">
        {teacher?.classes.map((klass) => (
          <li key={klass.id}>
            <Link
              href={`/portal/classes/${klass.id}`}
              className="underline"
            >
              {klass.name}
            </Link>{" "}
            <span className="text-sm opacity-60">
              ({klass._count.students} students)
            </span>
          </li>
        ))}
        {(!teacher || teacher.classes.length === 0) && (
          <p className="opacity-60">No classes assigned yet.</p>
        )}
      </ul>
    </div>
  );
}
