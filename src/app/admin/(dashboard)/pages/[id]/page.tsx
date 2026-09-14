import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageForm } from "@/components/admin/PageForm";
import { updatePage } from "@/lib/actions/pages";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Page</h1>
      <PageForm
        action={updatePage.bind(null, page.id)}
        initial={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          published: page.published,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
