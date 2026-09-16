import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  const settings = await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site", schoolName: "Shri Brijmohan Sharma Ismarak Inter College" },
  });
  return settings;
}
