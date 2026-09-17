import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = session?.user.role;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <nav className="flex items-center gap-4 text-sm">
          <span className="font-medium">Staff &amp; Student Portal</span>
          <Link href="/portal">Dashboard</Link>
          {(role === "TEACHER" || role === "PRINCIPAL") && (
            <Link href="/portal/classes">
              {role === "PRINCIPAL" ? "All Classes" : "My Classes"}
            </Link>
          )}
          {role === "PRINCIPAL" && (
            <>
              <Link href="/portal/staff">Staff Directory</Link>
              <Link href="/portal/all-students">All Students</Link>
            </>
          )}
          {role === "STUDENT" && (
            <>
              <Link href="/portal/attendance">Attendance</Link>
              <Link href="/portal/grades">Grades</Link>
              <Link href="/portal/results">Results</Link>
            </>
          )}
        </nav>
        {session && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/portal/login" });
            }}
          >
            <button type="submit" className="text-sm underline">
              Sign out ({session.user.name})
            </button>
          </form>
        )}
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
