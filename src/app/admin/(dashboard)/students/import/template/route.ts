import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicYear } from "@/lib/academicYear";

export async function GET() {
  const currentYear = await getCurrentAcademicYear();
  const classes = currentYear
    ? await prisma.class.findMany({
        where: { academicYearId: currentYear.id },
        orderBy: { name: "asc" },
      })
    : [];
  const exampleClassName = classes[0]?.name ?? "10th";

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  sheet.columns = [
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Class", key: "class", width: 16 },
    { header: "Password", key: "password", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    class: exampleClassName,
    password: "",
  });
  sheet.addRow({
    name: "Ishita Verma",
    email: "ishita.verma@example.com",
    class: exampleClassName,
    password: "",
  });

  const noteRow = sheet.addRow([
    "Tip: Class must match an existing class name in the selected academic year (case-insensitive). Leave Password blank to auto-generate one.",
  ]);
  sheet.mergeCells(`A${noteRow.number}:D${noteRow.number}`);
  noteRow.getCell(1).font = { italic: true, color: { argb: "FF6B7280" } };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(Buffer.from(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="student-import-sample.xlsx"',
    },
  });
}
