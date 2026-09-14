import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePage } from "@/lib/actions/pages";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages (CMS)</h1>
        <Link
          href="/admin/pages/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          New Page
        </Link>
      </div>

      <table className="mt-6 w-full max-w-3xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Title</th>
            <th className="py-2">Slug</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr
              key={page.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{page.title}</td>
              <td className="py-2 font-mono opacity-70">/{page.slug}</td>
              <td className="py-2">
                {page.published ? "Published" : "Draft"}
              </td>
              <td className="flex gap-4 py-2">
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="underline"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deletePage.bind(null, page.id)}
                  confirmMessage={`Delete page "${page.title}"?`}
                />
              </td>
            </tr>
          ))}
          {pages.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center opacity-60">
                No pages yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
