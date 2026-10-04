import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { Card } from "@/components/ui/card";
import { PAGE_KEYS, PAGE_LABELS } from "@/lib/pageContent";
import { prisma } from "@/lib/prisma";

export default async function AdminContentPage() {
  const rows = await prisma.pageContent.findMany({
    select: { key: true, updatedAt: true },
  });
  const updated = new Map(rows.map((r) => [r.key, r.updatedAt]));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Site Pages"
        description="Edit the text and images on the Home, About Us and Contact Us pages."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAGE_KEYS.map((key) => {
          const page = PAGE_LABELS[key];
          const at = updated.get(key);
          return (
            <Card key={key} className="flex flex-col gap-3 p-5">
              <div>
                <h2 className="text-lg font-semibold">{page.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {at ? `Last edited ${at.toLocaleString()}` : "Using default content"}
              </p>
              <div className="mt-auto flex gap-2">
                <LinkButton href={`/admin/content/${key}`}>
                  <Pencil />
                  Edit
                </LinkButton>
                <LinkButton href={page.href} variant="outline">
                  View page
                </LinkButton>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
