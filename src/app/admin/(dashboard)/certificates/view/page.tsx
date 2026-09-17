import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { getStudentFeeStatus } from "@/lib/fees";
import { PrintButton } from "@/components/admin/PrintButton";
import { SchoolLogo } from "@/components/site/SchoolLogo";

const TITLES: Record<string, string> = {
  BONAFIDE: "Bonafide Certificate",
  TRANSFER: "Transfer Certificate",
  CHARACTER: "Character Certificate",
  HALL_TICKET: "Examination Hall Ticket",
};

function certificateBody(
  type: string,
  studentName: string,
  className: string,
  schoolName: string,
) {
  switch (type) {
    case "BONAFIDE":
      return `This is to certify that ${studentName} is a bonafide student of ${className} at ${schoolName} for the current academic year.`;
    case "TRANSFER":
      return `This is to certify that ${studentName}, a student of ${className} at ${schoolName}, is relieved from the institution and is free to join another school.`;
    case "CHARACTER":
      return `This is to certify that ${studentName}, a student of ${className} at ${schoolName}, bears a good moral character to the best of our knowledge.`;
    default:
      return "";
  }
}

export default async function CertificateViewPage(
  props: PageProps<"/admin/certificates/view">,
) {
  await requirePermission("admin.certificates");
  const searchParams = await props.searchParams;

  const studentId =
    typeof searchParams.studentId === "string" ? searchParams.studentId : "";
  const type = typeof searchParams.type === "string" ? searchParams.type : "";
  const term = typeof searchParams.term === "string" ? searchParams.term : "";

  if (!studentId || !TITLES[type]) notFound();

  const [student, settings] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true, class: true },
    }),
    getSiteSettings(),
  ]);
  if (!student) notFound();

  if (type === "HALL_TICKET") {
    if (!term) {
      return (
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold">Term required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a term to check the fee status for the hall ticket.
          </p>
          <Link href="/admin/certificates" className="mt-4 inline-block text-sm underline">
            ← Back
          </Link>
        </div>
      );
    }

    const { amountDue, amountPaid } = await getStudentFeeStatus(studentId, term);
    const eligible = amountDue > 0 && amountPaid >= amountDue / 2;

    if (!eligible) {
      return (
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-destructive">
            Hall ticket not available
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {amountDue === 0
              ? `No fee structure is set for ${student.class?.name ?? "this student's class"} / ${term}.`
              : `${student.user.name} has paid ${amountPaid.toFixed(2)} of ${amountDue.toFixed(2)} due for ${term} -- at least half must be paid to download the hall ticket.`}
          </p>
          <Link href="/admin/certificates" className="mt-4 inline-block text-sm underline">
            ← Back
          </Link>
        </div>
      );
    }
  }

  const className = student.class?.name ?? "—";

  return (
    <div>
      <div className="mb-4 print:hidden">
        <PrintButton />
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-10 text-[#0f3d63] shadow-sm print:border-none print:shadow-none">
        <div className="flex items-center justify-center gap-3 border-b border-[#0f3d63]/20 pb-4">
          <SchoolLogo className="h-12 w-12" />
          <div className="text-center">
            <p className="text-lg font-bold">{settings.schoolName}</p>
            {settings.address && (
              <p className="text-xs text-muted-foreground">{settings.address}</p>
            )}
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-semibold underline">
          {TITLES[type]}
        </h1>

        {type === "HALL_TICKET" ? (
          <div className="mt-8 flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-medium">{student.user.name}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Class</span>
              <span className="font-medium">{className}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Term</span>
              <span className="font-medium">{term}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="text-muted-foreground">Roll No.</span>
              <span className="font-medium">{student.id.slice(-6).toUpperCase()}</span>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-center leading-relaxed">
            {certificateBody(type, student.user.name, className, settings.schoolName)}
          </p>
        )}

        <div className="mt-16 flex justify-between text-sm">
          <div>
            <p className="border-t border-[#0f3d63]/40 pt-1">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-center">
            <p className="border-t border-[#0f3d63]/40 pt-1">Principal / Head of Institution</p>
          </div>
        </div>
      </div>
    </div>
  );
}
