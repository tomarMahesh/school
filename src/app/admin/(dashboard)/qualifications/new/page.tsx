import { NameForm } from "@/components/admin/NameForm";
import { createQualification } from "@/lib/actions/masters";

export default function NewQualificationPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Qualification</h1>
      <NameForm
        action={createQualification}
        placeholder="B.Ed"
        submitLabel="Create Qualification"
      />
    </div>
  );
}
