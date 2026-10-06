"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientIpFromHeaders } from "@/lib/loginSecurity";
import { logger } from "@/lib/logger";

type ActionState = { error?: string; success?: boolean };

const MAX_MESSAGES_PER_IP_PER_HOUR = 5;

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function markMessageRead(id: string) {
  await requireAdmin();
  await prisma.contactMessage.update({ where: { id }, data: { read: true } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export async function submitContactMessage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const message = (formData.get("message") as string)?.trim();

  // Hidden "website" field: people never see it, bots fill it in. Pretend it
  // worked so the bot gets no hint, but store nothing.
  if (String(formData.get("website") ?? "").trim()) {
    logger.warn("contact_spam_blocked", { reason: "honeypot" });
    return { success: true };
  }

  if (!name) return { error: "Name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email is required." };
  }
  if (!message) return { error: "Message is required." };
  if (name.length > 100 || email.length > 190 || (phone?.length ?? 0) > 30 || message.length > 3000) {
    return { error: "One of the fields is too long." };
  }

  const ip = clientIpFromHeaders(await headers());
  if (ip !== "unknown") {
    const identifier = `contact-ip:${ip}`;
    const recent = await prisma.loginAttempt.count({
      where: { identifier, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recent >= MAX_MESSAGES_PER_IP_PER_HOUR) {
      logger.warn("contact_rate_limited", { ip });
      return { error: "You've sent several messages recently. Please try again in a while." };
    }
    await prisma.loginAttempt.create({ data: { identifier, ip, success: true } });
  }

  await prisma.contactMessage.create({ data: { name, email, phone, message } });

  return { success: true };
}
