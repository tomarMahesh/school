import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { clientIpFromHeaders, verifyPassword } from "@/lib/loginSecurity";
import { VERIFIED_GRACE_MS } from "@/lib/twoFactor";
import { twoFactorEnabled } from "@/lib/twoFactorConfig";

type AuthUser = { id: string; email: string; name: string; role: "ADMIN" | "PRINCIPAL" | "TEACHER" | "STAFF" | "STUDENT" };

function toAuthUser(user: AuthUser): AuthUser {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        challengeId: {},
      },
      // The one place a session can be created, and this endpoint is public
      // (/api/auth/callback/credentials), so every rule is enforced here
      // rather than trusting the login pages:
      //  - While TWO_FACTOR_AUTH is on (the default), ADMIN can never sign in
      //    with a password alone. They need a challenge whose SMS code was
      //    verified (see loginSecurity/twoFactor). Setting TWO_FACTOR_AUTH=false
      //    in .env is the only thing that lifts this.
      //  - Password attempts are throttled (see loginSecurity).
      authorize: async (credentials, request) => {
        const challengeId = credentials?.challengeId as string | undefined;

        if (challengeId) {
          const challenge = await prisma.loginChallenge.findUnique({
            where: { id: challengeId },
            include: { user: true },
          });
          if (
            !challenge ||
            !challenge.verifiedAt ||
            challenge.consumedAt ||
            challenge.user.role !== "ADMIN" ||
            Date.now() - challenge.verifiedAt.getTime() > VERIFIED_GRACE_MS
          ) {
            return null;
          }
          // Single use: only one caller can flip consumedAt from null.
          const claimed = await prisma.loginChallenge.updateMany({
            where: { id: challengeId, consumedAt: null },
            data: { consumedAt: new Date() },
          });
          return claimed.count === 1 ? toAuthUser(challenge.user) : null;
        }

        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const ip = clientIpFromHeaders(request.headers);
        const result = await verifyPassword(email, password, ip);
        if (!result.ok) return null;
        if (result.user.role === "ADMIN" && twoFactorEnabled()) return null;

        return toAuthUser(result.user);
      },
    }),
  ],
});
