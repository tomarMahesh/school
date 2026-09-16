"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

type ActionState = { error?: string; success?: boolean };

export async function updateSiteSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("admin.settings");

  const schoolName = (formData.get("schoolName") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;

  if (!schoolName) return { error: "School name is required." };

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: { schoolName, address, phone, email, logoUrl },
    create: { id: "site", schoolName, address, phone, email, logoUrl },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/contact");
  return { success: true };
}
