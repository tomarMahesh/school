"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

type ActionState = { error?: string; success?: boolean };

const LOGO_DIR = path.join(process.cwd(), "public", "uploads", "logo");
const LOGO_URL_PREFIX = "/uploads/logo/";
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export async function updateSiteSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.settings");

  const schoolName = (formData.get("schoolName") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;

  if (!schoolName) return { error: "School name is required." };

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: { schoolName, address, phone, email },
    create: { id: "site", schoolName, address, phone, email },
  });

  revalidatePath("/", "layout");
  return { success: true };
}

async function deleteStoredLogo(url: string | null) {
  if (!url?.startsWith(LOGO_URL_PREFIX)) return;
  const filename = url.slice(LOGO_URL_PREFIX.length);
  if (!filename || filename.includes("/") || filename.includes("..")) return;
  await unlink(path.join(LOGO_DIR, filename)).catch(() => {});
}

export async function uploadSiteLogo(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.settings");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose and crop a logo first." };
  }
  if (file.type !== "image/png" && file.type !== "image/jpeg") {
    return { error: "Logo must be a PNG or JPEG image." };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "Logo is too large (max 2MB)." };
  }

  await mkdir(LOGO_DIR, { recursive: true });
  const filename = `${randomUUID()}.png`;
  await writeFile(path.join(LOGO_DIR, filename), Buffer.from(await file.arrayBuffer()));

  const previous = (await getSiteSettings()).logoUrl;
  await prisma.siteSettings.update({
    where: { id: "site" },
    data: { logoUrl: `${LOGO_URL_PREFIX}${filename}` },
  });
  await deleteStoredLogo(previous);

  revalidatePath("/", "layout");
  return { success: true };
}

export async function removeSiteLogo() {
  await requirePermission("admin.settings");

  const previous = (await getSiteSettings()).logoUrl;
  await prisma.siteSettings.update({ where: { id: "site" }, data: { logoUrl: null } });
  await deleteStoredLogo(previous);

  revalidatePath("/", "layout");
}
