import path from "node:path";

// Where admin uploads (gallery photos, the logo) live on disk. They are NOT
// in public/ because Next.js only serves public/ files that existed at build
// time, so anything uploaded later would 404 in production. They are served
// by src/app/uploads/[...path]/route.ts instead. On a server, point
// UPLOAD_DIR at a folder that survives redeploys (and include it in backups).
export const UPLOAD_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ||
    path.join(/*turbopackIgnore: true*/ process.cwd(), "storage", "uploads"),
);

export const GALLERY_DIR = path.join(UPLOAD_ROOT, "gallery");
export const LOGO_DIR = path.join(UPLOAD_ROOT, "logo");
