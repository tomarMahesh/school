import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { errorFields, logger } from "@/lib/logger";

// Audit trail: wraps the database client so every create/update/delete made by
// a signed-in person is recorded in AuditLog -- who, what, which record, and
// the before/after values of changed fields. Because it sits on the client,
// no admin action can be forgotten. Rules:
//  - Only changes made while someone is signed in are recorded (public form
//    submissions, scripts and background work have no actor and are skipped).
//  - Anything that looks like a secret (passwords, tokens, Aadhaar, phone for
//    sign-in codes) is stored as "[changed]", never as its value.
//  - Updates that change nothing are not recorded.
//  - Marking attendance / entering marks writes one row per student; those are
//    grouped into a single entry with a count.
//  - A failure to write the audit row is logged but never breaks the action.
// This file must not import "@/lib/prisma" (that file imports this one).

const SKIP_MODELS = new Set(["AuditLog", "LoginAttempt", "LoginChallenge", "PasswordSetupToken"]);
const BULK_MODELS = new Set(["Attendance", "ExamMark", "Grade"]);
const BULK_WINDOW_MS = 15_000;
const WRITE_OPS = new Set([
  "create",
  "createMany",
  "createManyAndReturn",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "upsert",
  "delete",
  "deleteMany",
]);
const SECRET_KEY = /password|secret|token|hash|otp|aadhar|twofactorphone/i;
const IGNORED_FIELDS = new Set(["updatedAt"]);
const LABEL_FIELDS = ["name", "title", "email", "slug", "key", "term"];

type Row = Record<string, unknown>;
type Actor = { id: string; name: string | null; email: string | null; role: string };

function lowerFirst(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function isPlain(v: unknown): v is Row {
  return typeof v === "object" && v !== null && !(v instanceof Date) && !Array.isArray(v);
}

function fmt(key: string, value: unknown): unknown {
  if (SECRET_KEY.test(key)) return "[changed]";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" && value.length > 200) return `${value.slice(0, 200)}…`;
  if (typeof value === "bigint") return value.toString();
  return value;
}

function scalars(row: unknown): Row {
  const out: Row = {};
  if (!isPlain(row)) return out;
  for (const [k, v] of Object.entries(row)) {
    if (IGNORED_FIELDS.has(k)) continue;
    if (v === null || ["string", "number", "boolean", "bigint"].includes(typeof v) || v instanceof Date) {
      out[k] = v;
    }
  }
  return out;
}

function sameValue(a: unknown, b: unknown) {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

/** Names of relation fields touched by a nested write (e.g. subjects, staff). */
function relationKeys(data: unknown): string[] {
  if (!isPlain(data)) return [];
  return Object.entries(data)
    .filter(([, v]) => isPlain(v) || Array.isArray(v))
    .map(([k]) => k);
}

function sanitizeWhere(where: unknown): unknown {
  if (!isPlain(where)) return where ?? null;
  const out: Row = {};
  for (const [k, v] of Object.entries(where)) {
    out[k] = SECRET_KEY.test(k) ? "[hidden]" : isPlain(v) ? sanitizeWhere(v) : fmt(k, v);
  }
  return out;
}

async function currentActor(): Promise<Actor | null> {
  try {
    // Loaded lazily: auth.ts imports the database client, so a static import would be circular.
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    if (!session?.user?.id) return null;
    return {
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      role: session.user.role,
    };
  } catch {
    return null; // no request in progress (script, build, background task)
  }
}

async function currentIp(): Promise<string | null> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim();
    return ip || null;
  } catch {
    return null;
  }
}

async function findBefore(base: PrismaClient, model: string, where: unknown): Promise<Row | null> {
  try {
    const delegate = (base as unknown as Record<string, { findUnique: (a: unknown) => Promise<Row | null> }>)[
      lowerFirst(model)
    ];
    return (await delegate.findUnique({ where })) ?? null;
  } catch {
    return null;
  }
}

async function labelFor(base: PrismaClient, model: string, row: unknown): Promise<string | null> {
  if (!isPlain(row)) return null;
  try {
    if ((model === "Student" || model === "Staff") && typeof row.userId === "string") {
      const user = await base.user.findUnique({
        where: { id: row.userId },
        select: { name: true, email: true },
      });
      if (user) return `${user.name} (${user.email})`.slice(0, 190);
    }
    if (model === "FeePayment") return `${row.term ?? ""} payment of ${row.amount ?? ""}`.trim().slice(0, 190);
    for (const field of LABEL_FIELDS) {
      const v = row[field];
      if (typeof v === "string" && v) return v.slice(0, 190);
    }
  } catch {
    /* label is a convenience only */
  }
  return null;
}

type Entry = {
  actor: Actor;
  ip: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string | null;
  label: string | null;
  changes: unknown;
  count: number;
};

// Bulk saves fire their per-row writes at the same instant. Without ordering,
// each would look for "a recent entry to join", find none, and create its own.
// Running them one after another per person/record type lets the 2nd..nth join
// the 1st. (In-process only: fine for a single app server.)
const locks = new Map<string, Promise<unknown>>();
async function serialized<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const run = (locks.get(key) ?? Promise.resolve()).catch(() => undefined).then(fn);
  locks.set(key, run);
  try {
    return await run;
  } finally {
    if (locks.get(key) === run) locks.delete(key);
  }
}

async function writeEntry(base: PrismaClient, e: Entry) {
  if (BULK_MODELS.has(e.entity) && e.count === 1) {
    return serialized(`${e.actor.id}:${e.entity}:${e.action}`, () => writeBulkOrNew(base, e));
  }
  return createRow(base, e);
}

async function writeBulkOrNew(base: PrismaClient, e: Entry) {
  const recent = await base.auditLog.findFirst({
    where: {
      actorId: e.actor.id,
      entity: e.entity,
      action: e.action,
      createdAt: { gte: new Date(Date.now() - BULK_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (recent) {
    await base.auditLog.update({ where: { id: recent.id }, data: { count: { increment: 1 } } });
    return;
  }
  return createRow(base, e);
}

async function createRow(base: PrismaClient, e: Entry) {
  await base.auditLog.create({
    data: {
      actorId: e.actor.id,
      actorName: e.actor.name,
      actorEmail: e.actor.email,
      actorRole: e.actor.role,
      action: e.action,
      entity: e.entity,
      entityId: e.entityId,
      label: e.label,
      changes: e.changes === undefined || e.changes === null ? null : JSON.stringify(e.changes),
      count: e.count,
      ip: e.ip,
    },
  });
}

export function auditExtension(base: PrismaClient) {
  return Prisma.defineExtension({
    name: "audit",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (SKIP_MODELS.has(model) || !WRITE_OPS.has(operation)) return query(args);

          const actor = await currentActor();
          if (!actor) return query(args);

          const a = args as { where?: unknown; data?: unknown };
          const needsBefore = operation === "update" || operation === "delete" || operation === "upsert";
          const before = needsBefore ? await findBefore(base, model, a.where) : null;

          const result = await query(args);

          try {
            const ip = await currentIp();
            const entry = await buildEntry(base, { model, operation, args: a, before, result, actor, ip });
            if (entry) await writeEntry(base, entry);
          } catch (err) {
            logger.error("audit_failed", { model, operation, ...errorFields(err) });
          }
          return result;
        },
      },
    },
  });
}

async function buildEntry(
  base: PrismaClient,
  ctx: {
    model: string;
    operation: string;
    args: { where?: unknown; data?: unknown };
    before: Row | null;
    result: unknown;
    actor: Actor;
    ip: string | null;
  },
): Promise<Entry | null> {
  const { model, operation, args, before, result, actor, ip } = ctx;
  const base0 = { actor, ip, entity: model };
  const rel = relationKeys(args.data);

  const createdChanges = (row: unknown) => {
    const out: Row = {};
    for (const [k, v] of Object.entries(scalars(row))) out[k] = fmt(k, v);
    if (rel.length) out.relations = rel;
    return out;
  };

  const idOf = (row: unknown) => {
    if (!isPlain(row)) return null;
    const v = row.id ?? row.key;
    return typeof v === "string" ? v : null;
  };

  // Many rows at once: record that it happened and how many, not every row.
  if (["createMany", "createManyAndReturn", "updateMany", "updateManyAndReturn", "deleteMany"].includes(operation)) {
    const count = Array.isArray(result) ? result.length : isPlain(result) && typeof result.count === "number" ? result.count : 0;
    if (count === 0) return null;
    const action = operation.startsWith("create") ? "CREATE" : operation.startsWith("update") ? "UPDATE" : "DELETE";
    const changes: Row = { note: `${count} record${count === 1 ? "" : "s"}` };
    if (action !== "CREATE") changes.where = sanitizeWhere(args.where);
    if (action === "UPDATE" && isPlain(args.data)) {
      changes.fields = Object.keys(args.data).map((k) => (SECRET_KEY.test(k) ? `${k} (hidden)` : k));
    }
    return { ...base0, action, entityId: null, label: null, changes, count };
  }

  if (operation === "delete") {
    const row = before ?? (isPlain(result) ? result : null);
    return {
      ...base0,
      action: "DELETE",
      entityId: idOf(row),
      label: await labelFor(base, model, row),
      changes: createdChanges(row),
      count: 1,
    };
  }

  const isCreate = operation === "create" || (operation === "upsert" && !before);
  if (isCreate) {
    return {
      ...base0,
      action: "CREATE",
      entityId: idOf(result),
      label: await labelFor(base, model, result),
      changes: createdChanges(result),
      count: 1,
    };
  }

  // update (or upsert that found an existing row): only what actually changed
  const after = scalars(result);
  const prev = scalars(before);
  const diff: Row = {};
  for (const [k, v] of Object.entries(after)) {
    if (!sameValue(prev[k], v)) {
      diff[k] = SECRET_KEY.test(k) ? "[changed]" : [fmt(k, prev[k]), fmt(k, v)];
    }
  }
  if (rel.length) diff.relations = rel;
  if (Object.keys(diff).length === 0) return null; // nothing changed
  return {
    ...base0,
    action: "UPDATE",
    entityId: idOf(result) ?? idOf(before),
    label: await labelFor(base, model, result ?? before),
    changes: diff,
    count: 1,
  };
}
