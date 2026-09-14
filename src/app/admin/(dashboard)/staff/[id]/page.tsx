import { notFound } from "next/navigation";
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
    include: { user: true },
  });
  if (!staff) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Staff</h1>
      <StaffForm
        action={updateStaff.bind(null, staff.id)}
        initial={{
          name: staff.user.name,
          email: staff.user.email,
          role: staff.user.role as "TEACHER" | "PRINCIPAL" | "STAFF",
          designation: staff.designation,
          qualification: staff.qualification,
          education: staff.education,
          aadharNumber: staff.aadharNumber,
          subjects: staff.subjects,
          phone: staff.phone,
          address: staff.address,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
