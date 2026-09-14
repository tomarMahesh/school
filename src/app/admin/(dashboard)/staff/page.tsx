import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteStaff } from "@/lib/actions/staff";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminStaffPage() {
  const staff = await prisma.staff.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Staff</h1>
        <Link
          href="/admin/staff/new"
          className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
        >
          Onboard Staff
        </Link>
      </div>

      <table className="mt-6 w-full max-w-3xl text-left text-sm">
        <thead>
          <tr className="border-b border-black/10 dark:border-white/10">
            <th className="py-2">Name</th>
            <th className="py-2">Designation</th>
            <th className="py-2">Role</th>
            <th className="py-2">Email</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id} className="border-b border-black/5 dark:border-white/5">
              <td className="py-2">{member.user.name}</td>
              <td className="py-2">{member.designation}</td>
              <td className="py-2 opacity-70">{member.user.role}</td>
              <td className="py-2 opacity-70">{member.user.email}</td>
              <td className="flex gap-4 py-2">
                <Link href={`/admin/staff/${member.id}`} className="underline">
                  Edit
                </Link>
                <DeleteButton
                  action={deleteStaff.bind(null, member.id)}
                  confirmMessage={`Remove staff member "${member.user.name}"? This deletes their account.`}
                />
              </td>
            </tr>
          ))}
          {staff.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center opacity-60">
                No staff yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
