import { StaffForm } from "@/components/admin/StaffForm";
import { createStaff } from "@/lib/actions/staff";

export default function NewStaffPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Onboard Staff</h1>
      <StaffForm action={createStaff} submitLabel="Onboard Staff" />
    </div>
  );
}
