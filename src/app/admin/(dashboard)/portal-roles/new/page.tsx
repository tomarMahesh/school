import { NameForm } from "@/components/admin/NameForm";
import { createPortalRole } from "@/lib/actions/masters";

export default function NewPortalRolePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Portal Role</h1>
      <NameForm
        action={createPortalRole}
        placeholder="Mathematics Teacher"
        submitLabel="Create Portal Role"
      />
    </div>
  );
}
