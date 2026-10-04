import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DistrictForm } from "@/components/admin/DistrictForm";
import { updateDistrict } from "@/lib/actions/masters";

export default async function EditDistrictPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const district = await prisma.district.findUnique({ where: { id } });
  if (!district) notFound();

  const states = await prisma.state.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit District</h1>
      <DistrictForm
        action={updateDistrict.bind(null, district.id)}
        initial={{ name: district.name, stateId: district.stateId }}
        states={states}
        submitLabel="Save Changes"
      />
    </div>
  );
}
