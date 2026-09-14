import { auth } from "@/lib/auth";

export default async function PortalDashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        Welcome, {session?.user.name}
      </h1>
      <p className="mt-2 text-sm opacity-70">
        Role: {session?.user.role}
      </p>
    </div>
  );
}
