import { GalleryUploadForm } from "@/components/admin/GalleryUploadForm";

export default function NewGalleryImagePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Photo</h1>
        <p className="text-sm text-muted-foreground">
          Choose a photo, crop it to the area you want shown, then upload.
        </p>
      </div>
      <GalleryUploadForm />
    </div>
  );
}
