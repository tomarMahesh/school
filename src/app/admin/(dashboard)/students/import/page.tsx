import { Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { ImportStudentsForm } from "@/components/admin/ImportStudentsForm";

export default async function ImportStudentsPage() {
  const academicYears = await prisma.academicYear.findMany({
    orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Import Students"
        description="Bulk-add students from an Excel sheet."
        action={
          <LinkButton href="/admin/students/import/template" variant="outline">
            <Download />
            Download Sample Excel
          </LinkButton>
        }
      />
      <ImportStudentsForm
        academicYears={academicYears.map((y) => ({ id: y.id, name: y.name }))}
      />
    </div>
  );
}
