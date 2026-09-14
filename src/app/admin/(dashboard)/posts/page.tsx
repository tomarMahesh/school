import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/posts";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">News &amp; Events</h1>
        <Link
          href="/admin/posts/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          New Post
        </Link>
      </div>

      <table className="mt-6 w-full max-w-3xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Title</th>
            <th className="py-2">Category</th>
            <th className="py-2">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{post.title}</td>
              <td className="py-2">{post.category}</td>
              <td className="py-2">
                {post.published ? "Published" : "Draft"}
              </td>
              <td className="flex gap-4 py-2">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="underline"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deletePost.bind(null, post.id)}
                  confirmMessage={`Delete post "${post.title}"?`}
                />
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center opacity-60">
                No posts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
