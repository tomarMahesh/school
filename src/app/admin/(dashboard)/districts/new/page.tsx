import { prisma } from "@/lib/prisma";
import { DistrictForm } from "@/components/admin/DistrictForm";
import { createDistrict } from "@/lib/actions/masters";

export default async function NewDistrictPage() {
  const states = await prisma.state.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New District</h1>
      <DistrictForm action={createDistrict} states={states} submitLabel="Create District" />
    </div>
  );
}
