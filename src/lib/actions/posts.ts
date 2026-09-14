"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, PostCategory } from "@/generated/prisma/client";
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

function readPostForm(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string) ?? "";
  const published = formData.get("published") === "on";
  const category = formData.get("category") as PostCategory;
  const rawSlug = (formData.get("slug") as string)?.trim();
  const slug = slugify(rawSlug || title);
  return { title, content, published, category, slug };
}

export async function createPost(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  const { title, content, published, category, slug } = readPostForm(formData);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug could not be generated from that title." };
  if (!Object.values(PostCategory).includes(category)) {
    return { error: "Invalid category." };
  }

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        published,
        category,
        slug,
        authorId: session.user.id,
        publishedAt: published ? new Date() : null,
      },
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

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function updatePost(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const { title, content, published, category, slug } = readPostForm(formData);

  if (!title) return { error: "Title is required." };
  if (!slug) return { error: "Slug could not be generated from that title." };
  if (!Object.values(PostCategory).includes(category)) {
    return { error: "Invalid category." };
  }

  const existing = await prisma.post.findUnique({ where: { id } });

  try {
    await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        published,
        category,
        slug,
        publishedAt:
          published && !existing?.published
            ? new Date()
            : existing?.publishedAt ?? null,
      },
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

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
}
