import type { NextAuthConfig } from "next-auth";

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
        session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
        session.user.id = token.sub!;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
