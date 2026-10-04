import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NameForm } from "@/components/admin/NameForm";
import { updatePortalRole } from "@/lib/actions/masters";

export default async function EditPortalRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const portalRole = await prisma.portalRole.findUnique({ where: { id } });
  if (!portalRole) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Portal Role</h1>
      <NameForm
        action={updatePortalRole.bind(null, portalRole.id)}
        initial={{ name: portalRole.name }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
