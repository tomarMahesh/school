import { PageForm } from "@/components/admin/PageForm";
import { createPage } from "@/lib/actions/pages";

export default function NewPagePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Page</h1>
      <PageForm action={createPage} submitLabel="Create Page" />
    </div>
  );
}
