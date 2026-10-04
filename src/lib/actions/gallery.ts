"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string };

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "gallery");
const MAX_FILE_BYTES = 8 * 1024 * 1024;

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function uploadGalleryImage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();

  const file = formData.get("file");
  const caption = (formData.get("caption") as string)?.trim() || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose and crop a photo first." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Only image files can be uploaded." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Image is too large (max 8MB)." };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.jpg`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  await prisma.galleryImage.create({
    data: {
      url: `/uploads/gallery/${filename}`,
      caption,
      uploadedById: session.user.id,
    },
  });

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(id: string) {
  await requireAdmin();

  const image = await prisma.galleryImage.delete({ where: { id } });

  const filename = image.url.split("/").pop();
  if (filename) {
    await unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}
