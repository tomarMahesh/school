import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteGalleryImage } from "@/lib/actions/gallery";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LinkButton } from "@/components/admin/LinkButton";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { Card } from "@/components/ui/card";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Gallery"
        description={`${images.length} photo${images.length === 1 ? "" : "s"}`}
        action={
          <LinkButton href="/admin/gallery/new">
            <Plus />
            Upload Photo
          </LinkButton>
        }
      />

      {images.length === 0 ? (
        <Card className="py-10 text-center text-muted-foreground">
          No photos yet. Upload one to show it on the public Gallery page.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.caption ?? "Gallery photo"}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <p className="truncate text-sm">
                  {image.caption ?? (
                    <span className="text-muted-foreground">No caption</span>
                  )}
                </p>
                <DeleteAlertButton
                  action={deleteGalleryImage.bind(null, image.id)}
                  itemLabel="this photo"
                  successMessage="Photo deleted."
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
