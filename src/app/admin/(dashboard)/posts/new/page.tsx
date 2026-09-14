import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "@/lib/actions/posts";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New Post</h1>
      <PostForm action={createPost} submitLabel="Create Post" />
    </div>
  );
}
