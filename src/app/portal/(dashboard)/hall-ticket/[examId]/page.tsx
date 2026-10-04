import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { getStudentFeeStatus } from "@/lib/fees";
import { PrintButton } from "@/components/portal/PrintButton";
import { SchoolLogo } from "@/components/site/SchoolLogo";

export default async function MyHallTicketPage(
  props: PageProps<"/portal/hall-ticket/[examId]">,
) {
  const { examId } = await props.params;
  const session = await auth();
  if (session?.user.role !== "STUDENT") redirect("/portal");

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { user: true, class: true },
  });
  if (!student) notFound();

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.classId !== student.classId) notFound();

  const settings = await getSiteSettings();
  const { status, amountDue, amountPaid } = await getStudentFeeStatus(
    student.id,
    exam.term,
  );
  const eligible = amountDue > 0 && amountPaid >= amountDue / 2;

  if (!eligible) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold text-red-600">
          Hall ticket not available
        </h1>
        <p className="mt-2 text-sm opacity-70">
          {status === "NO_STRUCTURE"
            ? `No fee structure is set for ${exam.term} yet -- check back later.`
            : `You have paid ${amountPaid.toFixed(2)} of ${amountDue.toFixed(2)} due for ${exam.term}. At least half must be paid to download your hall ticket.`}
        </p>
        <Link href="/portal/fees" className="mt-4 inline-block text-sm underline">
          View my fees →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 print:hidden">
        <PrintButton />
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border bg-white p-10 text-[#0f3d63] shadow-sm print:border-none print:shadow-none">
        <div className="flex items-center justify-center gap-3 border-b border-[#0f3d63]/20 pb-4">
          <SchoolLogo className="h-12 w-12" src={settings.logoUrl} />
          <div className="text-center">
            <p className="text-lg font-bold">{settings.schoolName}</p>
            {settings.address && (
              <p className="text-xs text-muted-foreground">{settings.address}</p>
            )}
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-semibold underline">
          Examination Hall Ticket
        </h1>

        <div className="mt-8 flex flex-col gap-3 text-sm">
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">Student Name</span>
            <span className="font-medium">{student.user.name}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">Class</span>
            <span className="font-medium">{student.class?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">Exam</span>
            <span className="font-medium">{exam.name}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">Term</span>
            <span className="font-medium">{exam.term}</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span className="text-muted-foreground">Roll No.</span>
            <span className="font-medium">
              {student.id.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        <div className="mt-16 flex justify-between text-sm">
          <div>
            <p className="border-t border-[#0f3d63]/40 pt-1">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <p className="border-t border-[#0f3d63]/40 pt-1">
              Principal / Head of Institution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
