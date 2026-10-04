"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PersistentForm } from "@/components/PersistentForm";
import { promoteClasses } from "@/lib/actions/promote";

export function PromoteForm({
  fromYearId,
  toYearId,
  toYearName,
  classes,
}: {
  fromYearId: string;
  toYearId: string;
  toYearName: string;
  classes: { id: string; name: string; studentCount: number }[];
}) {
  const action = promoteClasses.bind(null, fromYearId, toYearId);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <PersistentForm action={formAction} className="flex flex-col gap-4">
      <Card className="max-w-2xl p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From Class</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>New Class Name in {toYearName}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.studentCount}</TableCell>
                <TableCell>
                  <Input
                    name={`target_${c.id}`}
                    defaultValue={c.studentCount > 0 ? c.name : ""}
                    placeholder="Leave blank to skip"
                    className="max-w-xs"
                  />
                </TableCell>
              </TableRow>
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  No classes in the source year.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <p className="text-sm text-muted-foreground">
        Reusing the same target name for two source classes merges their
        students into one class. Leave a row blank to skip promoting that
        class.
      </p>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      {classes.length > 0 && (
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Promoting..." : "Promote Students"}
        </Button>
      )}
    </PersistentForm>
  );
}
