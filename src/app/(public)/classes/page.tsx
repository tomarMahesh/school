import { prisma } from "@/lib/prisma";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: { teacher: { include: { user: true } }, section: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold">Our Classes</h1>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((klass) => (
          <div
            key={klass.id}
            className="rounded-lg border border-[#0f3d63]/10 p-5 shadow-sm"
          >
            <h3 className="font-semibold text-[#0f3d63]">
              {klass.name}
              {klass.section ? ` - ${klass.section.name}` : ""}
            </h3>
            <p className="mt-1 text-sm opacity-70">
              {klass.teacher ? `Class Teacher: ${klass.teacher.user.name}` : "Teacher: to be assigned"}
            </p>
          </div>
        ))}
        {classes.length === 0 && (
          <p className="col-span-full text-center opacity-60">
            Classes will be listed here once added by the school office.
          </p>
        )}
      </div>
    </div>
  );
}
