import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptField, maskAadhar } from "@/lib/fieldCrypto";
import { ChangePasswordForm } from "@/components/portal/ChangePasswordForm";
import { ContactInfoForm } from "@/components/portal/ContactInfoForm";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/portal/login");

  const role = session.user.role;

  const student =
    role === "STUDENT"
      ? await prisma.student.findUnique({
          where: { userId: session.user.id },
          include: { class: { include: { academicYear: true } } },
        })
      : null;

  const staff =
    role !== "STUDENT"
      ? await prisma.staff.findUnique({
          where: { userId: session.user.id },
          include: { subjects: true, classes: true },
        })
      : null;

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold">My Profile</h1>

        <dl className="mt-4 grid grid-cols-[140px_1fr] gap-y-2 text-sm">
          <dt className="opacity-60">Name</dt>
          <dd>{session.user.name}</dd>
          <dt className="opacity-60">Email</dt>
          <dd>{session.user.email}</dd>
          <dt className="opacity-60">Role</dt>
          <dd>{role}</dd>

          {student && (
            <>
              <dt className="opacity-60">Class</dt>
              <dd>{student.class?.name ?? "Unassigned"}</dd>
              <dt className="opacity-60">Academic Year</dt>
              <dd>{student.class?.academicYear.name ?? "—"}</dd>
            </>
          )}

          {staff && (
            <>
              <dt className="opacity-60">Designation</dt>
              <dd>{staff.designation}</dd>
              <dt className="opacity-60">Qualification</dt>
              <dd>{staff.qualification ?? "—"}</dd>
              <dt className="opacity-60">Education</dt>
              <dd>{staff.education ?? "—"}</dd>
              <dt className="opacity-60">Aadhar No.</dt>
              <dd>{maskAadhar(staff.aadharNumber ? decryptField(staff.aadharNumber) : null)}</dd>
              {staff.subjects.length > 0 && (
                <>
                  <dt className="opacity-60">Subjects</dt>
                  <dd>{staff.subjects.map((s) => s.name).join(", ")}</dd>
                </>
              )}
              {staff.classes.length > 0 && (
                <>
                  <dt className="opacity-60">Classes</dt>
                  <dd>{staff.classes.map((c) => c.name).join(", ")}</dd>
                </>
              )}
            </>
          )}
        </dl>
        <p className="mt-3 text-xs opacity-50">
          Name, role, and academic assignments are managed by the school
          admin. Contact the office if any of this needs correcting.
        </p>
      </div>

      {staff && (
        <div>
          <h2 className="text-lg font-medium">Contact Info</h2>
          <p className="mt-1 text-sm opacity-60">
            Keep your phone and address up to date.
          </p>
          <div className="mt-3">
            <ContactInfoForm
              initial={{ phone: staff.phone, address: staff.address }}
            />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium">Account Settings</h2>
        <p className="mt-1 text-sm opacity-60">Change your login password.</p>
        <div className="mt-3">
          <ChangePasswordForm
            context={{ name: session.user.name, email: session.user.email }}
          />
        </div>
      </div>
    </div>
  );
}
