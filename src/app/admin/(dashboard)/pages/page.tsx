import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deletePage } from "@/lib/actions/pages";
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

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pages (CMS)"
        description={`${pages.length} page${pages.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/pages/new">
            <Plus />
            New Page
          </LinkButton>
        }
      />

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  /{page.slug}
                </TableCell>
                <TableCell>
                  {page.published ? (
                    <Badge className="bg-primary/10 text-primary">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <LinkButton
                      href={`/admin/pages/${page.id}`}
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </LinkButton>
                    <DeleteAlertButton
                      action={deletePage.bind(null, page.id)}
                      itemLabel={page.title}
                      successMessage="Page deleted."
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  No pages yet. Click &quot;New Page&quot; to add one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
