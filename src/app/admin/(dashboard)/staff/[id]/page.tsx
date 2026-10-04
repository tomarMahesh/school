import { notFound } from "next/navigation";
import { decryptField } from "@/lib/fieldCrypto";
import { prisma } from "@/lib/prisma";
import { StaffForm } from "@/components/admin/StaffForm";
import { updateStaff } from "@/lib/actions/staff";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const staff = await prisma.staff.findUnique({
    where: { id },
    include: { user: true, subjects: true },
  });
  if (!staff) notFound();

  const [subjects, portalRoles, qualifications] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.portalRole.findMany({ orderBy: { name: "asc" } }),
    prisma.qualification.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Staff</h1>
      <StaffForm
        action={updateStaff.bind(null, staff.id)}
        initial={{
          userId: staff.userId,
          name: staff.user.name,
          email: staff.user.email,
          role: staff.user.role as "TEACHER" | "PRINCIPAL" | "STAFF",
          designation: staff.designation,
          qualification: staff.qualification,
          education: staff.education,
          aadharNumber: staff.aadharNumber ? decryptField(staff.aadharNumber) : null,
          subjectIds: staff.subjects.map((s) => s.id),
          phone: staff.phone,
          address: staff.address,
        }}
        subjects={subjects}
        portalRoles={portalRoles}
        qualifications={qualifications}
        submitLabel="Save Changes"
      />
    </div>
  );
}
