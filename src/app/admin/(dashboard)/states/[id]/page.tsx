import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NameForm } from "@/components/admin/NameForm";
import { updateState } from "@/lib/actions/masters";

export default async function EditStatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = await prisma.state.findUnique({ where: { id } });
  if (!state) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit State</h1>
      <NameForm
        action={updateState.bind(null, state.id)}
        initial={{ name: state.name }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
