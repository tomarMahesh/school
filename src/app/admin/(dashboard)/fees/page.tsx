import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { getStudentFeeStatus } from "@/lib/fees";
import { deleteFeeStructure, deletePayment } from "@/lib/actions/fees";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FeeStructureForm } from "@/components/admin/FeeStructureForm";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { DeleteAlertButton } from "@/components/admin/DeleteAlertButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-primary/10 text-primary",
  PARTIAL: "bg-orange-100 text-orange-700",
  UNPAID: "bg-red-100 text-red-700",
  NO_STRUCTURE: "bg-slate-100 text-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  PAID: "Paid",
  PARTIAL: "Partial",
  UNPAID: "Unpaid",
  NO_STRUCTURE: "No fee set",
};

export default async function AdminFeesPage(props: PageProps<"/admin/fees">) {
  await requirePermission("admin.fees");
  const searchParams = await props.searchParams;

  const [classes, structures, students, recentPayments] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.feeStructure.findMany({
      include: { class: true },
      orderBy: [{ term: "asc" }, { class: { name: "asc" } }],
    }),
    prisma.student.findMany({
      include: { user: true, class: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.feePayment.findMany({
      include: { student: { include: { user: true } } },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
  ]);

  const terms = Array.from(new Set(structures.map((s) => s.term)));
  const selectedTerm =
    typeof searchParams.term === "string" ? searchParams.term : terms[0];

  const statuses = selectedTerm
    ? await Promise.all(
        students.map(async (s) => ({
          student: s,
          ...(await getStudentFeeStatus(s.id, selectedTerm)),
        })),
      )
    : [];

  const activeTab = typeof searchParams.tab === "string" ? searchParams.tab : "structure";

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Fees Collection"
        description="Set fee amounts per class and record payments received."
      />

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="structure">Fee Structure</TabsTrigger>
          <TabsTrigger value="payments">Record Payment</TabsTrigger>
          <TabsTrigger value="status">Status Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="flex flex-col gap-6">
          <Card className="p-4">
            <FeeStructureForm classes={classes} />
          </Card>
          <Card className="max-w-xl p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structures.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.class.name}</TableCell>
                    <TableCell>{s.term}</TableCell>
                    <TableCell>{s.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DeleteAlertButton
                        action={deleteFeeStructure.bind(null, s.id)}
                        itemLabel={`${s.class.name} / ${s.term} fee`}
                        successMessage="Fee structure deleted."
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {structures.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      No fee structures set yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="flex flex-col gap-6">
          <Card className="p-4">
            <PaymentForm
              students={students.map((s) => ({
                id: s.id,
                name: s.user.name,
                className: s.class?.name ?? null,
              }))}
            />
          </Card>
          <Card className="max-w-2xl p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.student.user.name}</TableCell>
                    <TableCell>{p.term}</TableCell>
                    <TableCell>{p.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.method ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.paidAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteAlertButton
                        action={deletePayment.bind(null, p.id)}
                        itemLabel={`this payment from ${p.student.user.name}`}
                        successMessage="Payment deleted."
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {recentPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="flex flex-col gap-4">
          <form method="get" className="flex items-end gap-3">
            <div className="flex flex-col gap-1.5 text-sm">
              <label htmlFor="term">Term</label>
              <select
                id="term"
                name="term"
                defaultValue={selectedTerm}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                {terms.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="tab" value="status" />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
            >
              View
            </button>
          </form>

          <Card className="max-w-2xl p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map(({ student, status, amountDue, amountPaid }) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.class?.name ?? "—"}
                    </TableCell>
                    <TableCell>{amountDue.toFixed(2)}</TableCell>
                    <TableCell>{amountPaid.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[status]}>{STATUS_LABEL[status]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {statuses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      Set a fee structure first to see status here.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
