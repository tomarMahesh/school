import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StaffDirectoryPage() {
  const session = await auth();
  if (session?.user.role !== "PRINCIPAL") redirect("/portal");

  const staff = await prisma.staff.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Staff Directory</h1>
      <table className="mt-6 w-full max-w-2xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Designation</th>
            <th className="py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr
              key={member.id}
              className="border-b border-black/5 dark:border-white/5"
            >
              <td className="py-2">{member.user.name}</td>
              <td className="py-2">{member.designation}</td>
              <td className="py-2 opacity-70">{member.user.email}</td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center opacity-60">
                No staff records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
