"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersistentForm } from "@/components/PersistentForm";
import { importStudents } from "@/lib/actions/students";

export function ImportStudentsForm({
  academicYears,
}: {
  academicYears: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(importStudents, {});
  const defaultYearId = academicYears[0]?.id ?? "";

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-xl">
        <CardContent>
          <PersistentForm action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Academic Year</Label>
              <Select name="academicYearId" defaultValue={defaultYearId}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      academicYears.find((y) => y.id === value)?.name ?? "Select year"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The &quot;Class&quot; column in your sheet is matched against this
                year&apos;s classes.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="file">Excel File (.xlsx)</Label>
              <Input id="file" name="file" type="file" accept=".xlsx" required />
              <p className="text-xs text-muted-foreground">
                Columns required: Name, Email, Class. Password is optional --
                leave blank to auto-generate one.
              </p>
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}

            <Button type="submit" disabled={pending} className="mt-2 w-fit">
              {pending ? "Importing..." : "Import Students"}
            </Button>
          </PersistentForm>
        </CardContent>
      </Card>

      {state.results && (
        <Card className="p-0">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-semibold">Import Results</h2>
            <p className="text-sm text-muted-foreground">
              {state.results.filter((r) => r.status === "created").length} created,{" "}
              {state.results.filter((r) => r.status === "skipped").length} skipped
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Password / Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.results.map((r) => (
                <TableRow key={r.row}>
                  <TableCell className="text-muted-foreground">{r.row}</TableCell>
                  <TableCell>{r.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{r.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "created" ? "default" : "destructive"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.status === "created" ? r.password : r.message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
