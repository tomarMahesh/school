import { NameForm } from "@/components/admin/NameForm";
import { createStream } from "@/lib/actions/masters";

export default function NewStreamPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Stream</h1>
      <NameForm action={createStream} placeholder="Science" submitLabel="Create Stream" />
    </div>
  );
}
