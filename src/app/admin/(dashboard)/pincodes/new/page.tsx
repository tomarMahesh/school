import { prisma } from "@/lib/prisma";
import { PincodeForm } from "@/components/admin/PincodeForm";
import { createPincode } from "@/lib/actions/masters";

export default async function NewPincodePage() {
  const [states, districts] = await Promise.all([
    prisma.state.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Pincode</h1>
      <PincodeForm
        action={createPincode}
        states={states}
        districts={districts}
        submitLabel="Create Pincode"
      />
    </div>
  );
}
