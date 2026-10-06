import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_ROOT } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
const ALLOWED_FOLDERS = new Set(["gallery", "logo"]);
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

// Serves files the admin uploaded. Only two known folders, only image
// types, only plain file names -- nothing outside UPLOAD_ROOT is reachable.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await ctx.params;
  const notFound = new Response("Not found", { status: 404 });

  if (
    segments.length !== 2 ||
    !ALLOWED_FOLDERS.has(segments[0]) ||
    !segments.every((s) => SAFE_SEGMENT.test(s))
  ) {
    return notFound;
  }

  const type = TYPES[path.extname(segments[1]).toLowerCase()];
  if (!type) return notFound;

  const file = path.join(UPLOAD_ROOT, segments[0], segments[1]);
  if (!file.startsWith(UPLOAD_ROOT + path.sep)) return notFound;

  try {
    const bytes = await readFile(file);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        // File names are random and never reused, so they can be cached for good.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound;
  }
}
