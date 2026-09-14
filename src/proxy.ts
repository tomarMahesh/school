import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  if (pathname.startsWith("/portal") && pathname !== "/portal/login") {
    const portalRoles = ["TEACHER", "PRINCIPAL", "STAFF", "STUDENT"];
    if (!role || !portalRoles.includes(role)) {
      return NextResponse.redirect(new URL("/portal/login", req.url));
    }
  }
});

export default proxy;

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
