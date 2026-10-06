import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

const ACTION_STYLE: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-amber-100 text-amber-800",
  DELETE: "bg-red-100 text-red-800",
  SIGN_IN: "bg-blue-100 text-blue-800",
};

const field =
  "h-9 rounded-md border bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function words(entity: string) {
  return entity.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function show(v: unknown): string {
  if (v === null || v === undefined || v === "") return "(empty)";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function ChangeList({ json }: { json: string | null }) {
  if (!json) return <p className="text-muted-foreground">No further details.</p>;
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(json);
  } catch {
    return <p className="text-muted-foreground">Details unavailable.</p>;
  }
  return (
    <ul className="space-y-1">
      {Object.entries(data).map(([key, value]) => (
        <li key={key} className="break-words">
          <span className="font-medium">{key}</span>
          {": "}
          {Array.isArray(value) && value.length === 2 && key !== "relations" ? (
            <>
              <span className="text-red-700 line-through">{show(value[0])}</span>
              {" → "}
              <span className="text-green-700">{show(value[1])}</span>
            </>
          ) : (
            <span>{show(value)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function AuditLogPage(props: PageProps<"/admin/audit-log">) {
  const sp = await props.searchParams;
  const get = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");

  const entity = get("entity");
  const action = get("action");
  const actor = get("actor");
  const from = get("from");
  const to = get("to");
  const page = Math.max(1, Number(get("page")) || 1);

  const createdAt: { gte?: Date; lte?: Date } = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) createdAt.gte = new Date(`${from}T00:00:00+05:30`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) createdAt.lte = new Date(`${to}T23:59:59.999+05:30`);

  const where = {
    ...(entity ? { entity } : {}),
    ...(action ? { action } : {}),
    ...(actor ? { actorEmail: actor } : {}),
    ...(createdAt.gte || createdAt.lte ? { createdAt } : {}),
  };

  const [rows, total, entities, actors] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["entity"], orderBy: { entity: "asc" } }),
    prisma.auditLog.groupBy({ by: ["actorEmail"], orderBy: { actorEmail: "asc" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ entity, action, actor, from, to })) if (v) q.set(k, v);
    q.set("page", String(p));
    return `/admin/audit-log?${q.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Audit Log"
        description={`Who changed what. ${total} entr${total === 1 ? "y" : "ies"}${
          entity || action || actor || from || to ? " match the filters" : ""
        }.`}
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Person
          <select name="actor" defaultValue={actor} className={field}>
            <option value="">Everyone</option>
            {actors
              .filter((a) => a.actorEmail)
              .map((a) => (
                <option key={a.actorEmail} value={a.actorEmail!}>
                  {a.actorEmail}
                </option>
              ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Record type
          <select name="entity" defaultValue={entity} className={field}>
            <option value="">All</option>
            {entities.map((e) => (
              <option key={e.entity} value={e.entity}>
                {words(e.entity)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Action
          <select name="action" defaultValue={action} className={field}>
            <option value="">All</option>
            <option value="CREATE">Created</option>
            <option value="UPDATE">Updated</option>
            <option value="DELETE">Deleted</option>
            <option value="SIGN_IN">Signed in</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          From
          <input type="date" name="from" defaultValue={from} className={field} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          To
          <input type="date" name="to" defaultValue={to} className={field} />
        </label>
        <button type="submit" className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          Filter
        </button>
        <Link href="/admin/audit-log" className="h-9 content-center text-sm underline">
          Clear
        </Link>
      </form>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When (IST)</TableHead>
              <TableHead>Who</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="align-top">
                <TableCell className="whitespace-nowrap text-sm">
                  {r.createdAt.toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="font-medium">{r.actorName ?? "Unknown"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.actorEmail} · {r.actorRole?.toLowerCase()}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      ACTION_STYLE[r.action] ?? "bg-muted"
                    }`}
                  >
                    {r.action.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="font-medium">
                    {words(r.entity)}
                    {r.count > 1 ? ` × ${r.count}` : ""}
                  </div>
                  {r.label && <div className="text-xs text-muted-foreground">{r.label}</div>}
                </TableCell>
                <TableCell className="max-w-md text-xs">
                  <details>
                    <summary className="cursor-pointer text-primary">View</summary>
                    <div className="mt-2 space-y-2">
                      <ChangeList json={r.changes} />
                      {r.ip && <p className="text-muted-foreground">From address {r.ip}</p>}
                    </div>
                  </details>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Nothing recorded{total === 0 && (entity || action || actor || from || to) ? " for these filters" : " yet"}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pages}
          </span>
          <div className="flex gap-3">
            {page > 1 && (
              <Link href={link(page - 1)} className="underline">
                ← Newer
              </Link>
            )}
            {page < pages && (
              <Link href={link(page + 1)} className="underline">
                Older →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
