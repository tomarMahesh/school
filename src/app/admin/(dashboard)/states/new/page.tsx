import { NameForm } from "@/components/admin/NameForm";
import { createState } from "@/lib/actions/masters";

export default function NewStatePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New State</h1>
      <NameForm action={createState} placeholder="Uttar Pradesh" submitLabel="Create State" />
    </div>
  );
}
