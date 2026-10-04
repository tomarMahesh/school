import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "@/components/admin/StudentForm";
import { updateStudent } from "@/lib/actions/students";

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true, subjects: true },
  });
  if (!student) notFound();

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
      <h1 className="mb-6 text-2xl font-semibold">Edit Student</h1>
      <StudentForm
        action={updateStudent.bind(null, student.id)}
        initial={{
          userId: student.userId,
          name: student.user.name,
          email: student.user.email,
          classId: student.classId,
          streamId: student.streamId,
          subjectIds: student.subjects.map((s) => s.id),
          fatherName: student.fatherName,
          motherName: student.motherName,
          gender: student.gender,
          address: student.address,
          stateId: student.stateId,
          districtId: student.districtId,
          pincodeId: student.pincodeId,
        }}
        classes={classes}
        academicYears={academicYears}
        streams={streams}
        subjects={subjects}
        states={states}
        districts={districts}
        pincodes={pincodes}
        submitLabel="Save Changes"
      />
    </div>
  );
}
