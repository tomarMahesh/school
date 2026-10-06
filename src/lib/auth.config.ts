import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

export const authConfig = {
  // A school day: stolen or forgotten sessions expire the same evening.
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.sub!;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
