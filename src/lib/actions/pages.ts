"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type ActionState = { error?: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

function readPageForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) ?? "";
  const published = formData.get("published") === "on";
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = slugify(rawSlug || title);
  return { title, content, published, slug };
}

export async function createPage(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const { title, content, published, slug } = readPageForm(formData);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug could not be generated from that title." };

  try {
    await prisma.page.create({
      data: { title, content, published, slug, authorId: session.user.id },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `Slug "${slug}" is already in use.` };
    }
    throw err;
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { title, content, published, slug } = readPageForm(formData);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug could not be generated from that title." };

  try {
    await prisma.page.update({
      where: { id },
      data: { title, content, published, slug },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: `Slug "${slug}" is already in use.` };
    }
    throw err;
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await requireAdmin();
  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/pages");
}
