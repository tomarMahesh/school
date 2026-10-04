import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { hasPermission, hasAnyPermission, type PermissionKey } from "@/lib/permissions";

const { auth } = NextAuth(authConfig);

// Route prefixes that a granted PRINCIPAL/TEACHER/STAFF can reach.
// Every other /admin/* route stays ADMIN-only, since those pages only
// check requireAdmin() in their server actions, not on page load --
// opening the route itself would let a granted-nothing staff member
// still *view* e.g. the Students list.
const GRANTABLE_ROUTES: [string, PermissionKey][] = [
  ["/admin/holidays", "admin.holidays"],
  ["/admin/settings", "admin.settings"],
  ["/admin/fees", "admin.fees"],
  ["/admin/exams", "admin.exams"],
  ["/admin/certificates", "admin.certificates"],
];

// Attendance is deliberately NOT grantable -- only ADMIN (full access)
// and each class's own teacher (via /portal, scoped to their class)
// may view or mark attendance, so /admin/attendance stays hardcoded
// ADMIN-only below rather than joining GRANTABLE_ROUTES.

const proxy = auth(async (req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (role === "ADMIN") {
      // full access, fall through
    } else if (pathname === "/admin") {
      // Dashboard root: reachable by anyone with at least one grant,
      // so a granted Principal/Teacher/Staff has somewhere to land
      // after signing in -- the sidebar itself filters to their
      // granted sections only.
      const allowed = role ? await hasAnyPermission(role) : false;
      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    } else {
      const grantable = GRANTABLE_ROUTES.find(([prefix]) =>
        pathname.startsWith(prefix),
      );
      const allowed =
        grantable && role ? await hasPermission(role, grantable[1]) : false;

      if (!allowed) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
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
