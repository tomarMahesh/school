import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NameForm } from "@/components/admin/NameForm";
import { updateStream } from "@/lib/actions/masters";

export default async function EditStreamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stream = await prisma.stream.findUnique({ where: { id } });
  if (!stream) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Stream</h1>
      <NameForm
        action={updateStream.bind(null, stream.id)}
        initial={{ name: stream.name }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
