import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PincodeForm } from "@/components/admin/PincodeForm";
import { updatePincode } from "@/lib/actions/masters";

export default async function EditPincodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pincode = await prisma.pincode.findUnique({ where: { id } });
  if (!pincode) notFound();

  const [states, districts] = await Promise.all([
    prisma.state.findMany({ orderBy: { name: "asc" } }),
    prisma.district.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Pincode</h1>
      <PincodeForm
        action={updatePincode.bind(null, pincode.id)}
        initial={{ code: pincode.code, districtId: pincode.districtId }}
        states={states}
        districts={districts}
        submitLabel="Save Changes"
      />
    </div>
  );
}
