import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CertificateSelectForm } from "@/components/admin/CertificateSelectForm";
import { Card } from "@/components/ui/card";

export default async function AdminCertificatesPage() {
  await requirePermission("admin.certificates");

  const students = await prisma.student.findMany({
    include: { user: true, class: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Certificates"
        description="Generate a printable certificate for a student."
      />

      <Card className="max-w-lg p-4">
        <CertificateSelectForm
          students={students.map((s) => ({
            id: s.id,
            name: s.user.name,
            className: s.class?.name ?? null,
          }))}
        />
      </Card>
    </div>
  );
}
