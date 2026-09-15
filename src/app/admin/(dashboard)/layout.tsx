import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/pages">Pages</Link>
          <Link href="/admin/posts">News & Events</Link>
          <Link href="/admin/classes">Classes</Link>
          <Link href="/admin/streams">Streams</Link>
          <Link href="/admin/students">Students</Link>
          <Link href="/admin/staff">Staff</Link>
          <Link href="/admin/subjects">Subjects</Link>
          <Link href="/admin/sections">Sections</Link>
          <Link href="/admin/academic-years">Academic Years</Link>
          <Link href="/admin/messages">Messages</Link>
        </nav>
        {session && (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button type="submit" className="text-sm underline">
              Sign out ({session.user.email})
            </button>
          </form>
        )}
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
