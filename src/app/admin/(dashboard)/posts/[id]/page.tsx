import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "@/components/admin/PostForm";
import { updatePost } from "@/lib/actions/posts";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Post</h1>
      <PostForm
        action={updatePost.bind(null, post.id)}
        initial={{
          title: post.title,
          slug: post.slug,
          content: post.content,
          published: post.published,
          category: post.category,
        }}
        submitLabel="Save Changes"
      />
    </div>
  );
}
