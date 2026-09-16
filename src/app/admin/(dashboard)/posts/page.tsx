import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/lib/actions/posts";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CATEGORY_BADGE: Record<string, string> = {
  NEWS: "bg-blue-100 text-blue-700",
  EVENT: "bg-purple-100 text-purple-700",
  ANNOUNCEMENT: "bg-orange-100 text-orange-700",
};

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="News & Events"
        description={`${posts.length} post${posts.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/posts/new">
            <Plus />
            New Post
          </LinkButton>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  <Badge className={CATEGORY_BADGE[post.category] ?? ""}>
                    {post.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {post.published ? (
                    <Badge className="bg-primary/10 text-primary">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <LinkButton
                      href={`/admin/posts/${post.id}`}
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </LinkButton>
                    <DeleteAlertButton
                      action={deletePost.bind(null, post.id)}
                      itemLabel={post.title}
                      successMessage="Post deleted."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No posts yet. Click &quot;New Post&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
