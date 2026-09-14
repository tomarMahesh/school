import { auth, signOut } from "@/lib/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10">
        <span className="text-sm font-medium">Student & Teacher Portal</span>
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
