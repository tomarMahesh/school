import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";

const CARD_ACCENTS = [
  "from-[#0f3d63] to-[#154f80]",
  "from-[#154f80] to-[#1c5f8a]",
  "from-[#1c5f8a] to-[#0a2540]",
  "from-[#0a2540] to-[#0f3d63]",
];

const STREAM_ICON =
  "M12 2 1 8l11 6 9-4.91V17h2V8L12 2Zm0 13.6L4 11.2V16c0 2.21 3.58 4 8 4s8-1.79 8-4v-4.8l-8 4.4Z";

export default async function ClassesPage() {
  const currentYear = await getCurrentAcademicYear();
  const [classes, streams] = await Promise.all([
    prisma.class.findMany({
      where: currentYear ? { academicYearId: currentYear.id } : {},
      include: {
        teacher: { include: { user: true } },
        section: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.stream.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold text-[#0f3d63]">Our Classes</h1>
      <p className="mx-auto mt-3 max-w-xl text-center opacity-70">
        {currentYear
          ? `Classes currently running for academic year ${currentYear.name}.`
          : "Classes offered at our school."}
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((klass, i) => {
          const initial = klass.name.trim().charAt(0).toUpperCase() || "C";
          return (
            <div
              key={klass.id}
              className="group overflow-hidden rounded-xl border border-[#0f3d63]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                className={`flex items-center gap-4 bg-gradient-to-br px-5 py-6 text-white ${
                  CARD_ACCENTS[i % CARD_ACCENTS.length]
                }`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
                  {initial}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {klass.name}
                    {klass.section ? ` - ${klass.section.name}` : ""}
                  </h3>
                  <p className="text-xs text-white/70">
                    {klass._count.students} student{klass._count.students === 1 ? "" : "s"} enrolled
                  </p>
                </div>
              </div>
              <div className="px-5 py-4">
                <p className="text-sm opacity-70">
                  {klass.teacher
                    ? `Class Teacher: ${klass.teacher.user.name}`
                    : "Class teacher to be assigned"}
                </p>
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
          <p className="col-span-full text-center opacity-60">
            Classes will be listed here once added by the school office.
          </p>
        )}
      </div>

      <h2 className="mt-20 text-center text-2xl font-bold text-[#0f3d63]">Streams</h2>
      <p className="mx-auto mt-3 max-w-xl text-center opacity-70">
        Specializations available for our senior secondary students.
      </p>
      <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-4">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="flex items-center gap-2 rounded-full border border-[#d4a017] bg-[#d4a017]/5 px-5 py-2.5 text-sm font-semibold text-[#0f3d63] shadow-sm transition hover:bg-[#d4a017]/15"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d4a017]" fill="currentColor">
              <path d={STREAM_ICON} />
            </svg>
            {stream.name}
          </div>
        ))}
        {streams.length === 0 && (
          <p className="text-center opacity-60">Streams will be listed here once added.</p>
        )}
      </div>
    </div>
  );
}
