import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export default async function AboutPage() {
  const [studentCount, staffCount, classCount, settings] = await Promise.all([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.class.count(),
    getSiteSettings(),
  ]);
  const SCHOOL_NAME = settings.schoolName;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-center text-3xl font-bold">About Our School</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center opacity-80">
        {SCHOOL_NAME} is committed to providing quality education in a safe,
        supportive environment where every student is encouraged to grow
        academically, socially, and personally. Our experienced faculty and
        well-rounded programs prepare students for a lifetime of learning.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Experienced Faculty", desc: "Qualified, dedicated teachers guiding every classroom." },
          { title: "Modern Classrooms", desc: "A learning environment built for focus and engagement." },
          { title: "Sports & Activities", desc: "Well-rounded programs beyond the classroom." },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-[#0f3d63]/10 p-6 text-center shadow-sm"
          >
            <h3 className="font-semibold text-[#0f3d63]">{f.title}</h3>
            <p className="mt-2 text-sm opacity-70">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 text-center sm:grid-cols-4">
        {[
          { label: "Students", value: studentCount },
          { label: "Staff", value: staffCount },
          { label: "Classes", value: classCount },
          { label: "Est.", value: "—" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-bold text-[#d4a017]">{stat.value}</div>
            <div className="text-xs uppercase tracking-wide opacity-60">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
