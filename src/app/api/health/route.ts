import { prisma } from "@/lib/prisma";
import { errorFields, logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

// For uptime monitors and the Docker health check: 200 when the app can
// reach the database, 503 otherwise. Deliberately reveals nothing else.
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" }, { headers });
  } catch (err) {
    logger.error("health_check_failed", errorFields(err));
    return Response.json({ status: "error" }, { status: 503, headers });
  }
}
