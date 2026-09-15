import { prisma } from "@/lib/prisma";
import { StaffForm } from "@/components/admin/StaffForm";
import { createStaff } from "@/lib/actions/staff";

export default async function NewStaffPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Onboard Staff</h1>
      <StaffForm action={createStaff} subjects={subjects} submitLabel="Onboard Staff" />
    </div>
  );
}
