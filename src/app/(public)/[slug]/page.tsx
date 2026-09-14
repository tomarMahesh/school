import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CmsPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;

  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.published) notFound();

  return (
    <article>
      <h1 className="text-3xl font-bold">{page.title}</h1>
      <div className="mt-6 whitespace-pre-wrap leading-relaxed">
        {page.content}
      </div>
    </article>
  );
}
