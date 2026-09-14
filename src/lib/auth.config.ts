import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

export const authConfig = {
  session: { strategy: "jwt" },
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
