"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PAGE_KEYS,
  PAGE_LABELS,
  type AboutContent,
  type ContactContent,
  type HomeContent,
  type PageKey,
} from "@/lib/pageContent";

type ActionState = { error?: string; success?: boolean };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

function text(formData: FormData, name: string) {
  return ((formData.get(name) as string) ?? "").trim();
}

// Only images already on this site (built-in or uploaded through the
// Gallery) may be used, so a tampered form can't inject arbitrary URLs.
function isSiteImage(url: string) {
  return /^\/(images|uploads\/gallery)\/[\w./-]+$/.test(url) && !url.includes("..");
}

function readHome(formData: FormData): HomeContent | string {
  const heroTagline = text(formData, "heroTagline");
  const welcomeTitle = text(formData, "welcomeTitle");
  const welcomeText = text(formData, "welcomeText");
  if (!heroTagline) return "Hero tagline is required.";
  if (!welcomeTitle || !welcomeText) return "Welcome title and text are required.";

  const slides: HomeContent["slides"] = [];
  for (let i = 0; i < 3; i++) {
    const image = text(formData, `slides.${i}.image`);
    if (!isSiteImage(image)) return `Slide ${i + 1}: choose a valid image.`;
    slides.push({ image, caption: text(formData, `slides.${i}.caption`) });
  }

  const stats: HomeContent["stats"] = [];
  for (let i = 0; i < 4; i++) {
    const label = text(formData, `stats.${i}.label`);
    if (!label) continue;
    const value = Number(text(formData, `stats.${i}.value`));
    if (!Number.isFinite(value) || value < 0) return `Stat "${label}": enter a valid number.`;
    stats.push({ label, value: Math.round(value), suffix: text(formData, `stats.${i}.suffix`) });
  }

  const missionVision: HomeContent["missionVision"] = [];
  for (let i = 0; i < 3; i++) {
    const title = text(formData, `mv.${i}.title`);
    const summary = text(formData, `mv.${i}.summary`);
    if (!title || !summary) return `Block ${i + 1} (Mission / Vision / Focus) needs a title and summary.`;
    const details = text(formData, `mv.${i}.details`)
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    missionVision.push({ title, summary, details });
  }

  const testimonials: HomeContent["testimonials"] = [];
  for (let i = 0; i < 3; i++) {
    const quote = text(formData, `t.${i}.quote`);
    if (!quote) continue;
    testimonials.push({
      quote,
      name: text(formData, `t.${i}.name`) || "Anonymous",
      role: text(formData, `t.${i}.role`),
    });
  }

  return {
    heroTagline,
    slides,
    welcomeTitle,
    welcomeText,
    stats,
    missionVision,
    principalMessage: text(formData, "principalMessage"),
    testimonials,
  };
}

function readAbout(formData: FormData): AboutContent | string {
  const title = text(formData, "title");
  if (!title) return "Page title is required.";

  const sections: AboutContent["sections"] = [];
  for (let i = 0; i < 2; i++) {
    const heading = text(formData, `sections.${i}.heading`);
    const body = text(formData, `sections.${i}.text`);
    const image = text(formData, `sections.${i}.image`);
    if (!heading || !body) return `Section ${i + 1} needs a heading and text.`;
    if (!isSiteImage(image)) return `Section ${i + 1}: choose a valid image.`;
    sections.push({
      heading,
      text: body,
      image,
      imageAlt: text(formData, `sections.${i}.imageAlt`) || heading,
    });
  }
  return { title, sections };
}

function readContact(formData: FormData): ContactContent | string {
  const title = text(formData, "title");
  if (!title) return "Page title is required.";
  return { title, intro: text(formData, "intro"), hours: text(formData, "hours") };
}

export async function savePageContent(
  key: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!PAGE_KEYS.includes(key as PageKey)) return { error: "Unknown page." };

  const parsed =
    key === "home" ? readHome(formData) : key === "about" ? readAbout(formData) : readContact(formData);
  if (typeof parsed === "string") return { error: parsed };

  const data = JSON.stringify(parsed);
  await prisma.pageContent.upsert({
    where: { key },
    update: { data },
    create: { key, data },
  });

  revalidatePath(PAGE_LABELS[key as PageKey].href);
  revalidatePath("/admin/content");
  return { success: true };
}
