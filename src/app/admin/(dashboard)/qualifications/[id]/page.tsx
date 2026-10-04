import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NameForm } from "@/components/admin/NameForm";
import { updateQualification } from "@/lib/actions/masters";

export default async function EditQualificationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const qualification = await prisma.qualification.findUnique({ where: { id } });
  if (!qualification) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Qualification</h1>
      <NameForm
        action={updateQualification.bind(null, qualification.id)}
        initial={{ name: qualification.name }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
