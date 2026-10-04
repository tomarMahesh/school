import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/admin/StudentForm";
import { createStudent } from "@/lib/actions/students";

export default async function NewStudentPage() {
  const [classes, academicYears, streams, subjects, states, districts, pincodes] =
    await Promise.all([
      prisma.class.findMany({
        orderBy: [{ academicYear: { startDate: "desc" } }, { name: "asc" }],
      }),
      prisma.academicYear.findMany({
        orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
      }),
      prisma.stream.findMany({ orderBy: { name: "asc" } }),
      prisma.subject.findMany({ orderBy: { name: "asc" } }),
      prisma.state.findMany({ orderBy: { name: "asc" } }),
      prisma.district.findMany({ orderBy: { name: "asc" } }),
      prisma.pincode.findMany({ orderBy: { code: "asc" } }),
    ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Admit Student</h1>
      <StudentForm
        action={createStudent}
        classes={classes}
        academicYears={academicYears}
        streams={streams}
        subjects={subjects}
        states={states}
        districts={districts}
        pincodes={pincodes}
        submitLabel="Admit Student"
      />
    </div>
  );
}
