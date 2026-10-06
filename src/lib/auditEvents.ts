import { prisma } from "@/lib/prisma";
import { errorFields, logger } from "@/lib/logger";

// Events that are not database changes (so the client layer can't see them).
// Never lets a logging problem interrupt the sign-in itself.
export async function recordAdminSignIn(
  user: { id: string; name: string | null; email: string | null; role: string },
  ip: string | null,
) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        action: "SIGN_IN",
        entity: "Session",
        label: "Signed in with password and SMS code",
        ip,
      },
    });
  } catch (err) {
    logger.error("audit_failed", { event: "sign_in", ...errorFields(err) });
  }
}
