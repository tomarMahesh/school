// One password policy shared by the browser (live checklist) and the server
// actions (the authoritative check). Pure TypeScript -- no Node-only imports.

export const PASSWORD_MIN_LENGTH = 10;
// bcrypt silently ignores everything past 72 bytes, so reject longer input
// rather than let two different passwords hash identically.
export const PASSWORD_MAX_BYTES = 72;

export type PasswordContext = { name?: string | null; email?: string | null };

export type PasswordCheck = { id: string; label: string; ok: boolean };

// Alphabetic "cores" of very common passwords. A password is rejected when
// its letters-only form equals one of these, which also catches variants
// like "Password@123" or "Welcome#2026".
const COMMON_CORES = new Set([
  "password", "passw", "pass", "welcome", "letmein", "qwerty", "qwertyuiop",
  "asdfgh", "asdfghjkl", "zxcvbn", "zxcvbnm", "admin", "administrator",
  "iloveyou", "monkey", "dragon", "football", "cricket", "india", "bharat",
  "sachin", "krishna", "ganesh", "shiva", "ramram", "abcdef", "abcdefgh",
  "changeme", "default", "secret", "master", "login", "user", "test",
  "school", "college", "student", "teacher", "principal", "sbmsic",
  "sharma", "singh", "kumar", "hello", "sunshine", "princess", "superman",
]);

const SEQUENCES = [
  "0123456789", "9876543210", "abcdefghijklmnopqrstuvwxyz",
  "zyxwvutsrqponmlkjihgfedcba", "qwertyuiop", "asdfghjkl", "zxcvbnm",
];

// True when the letters are a common word with at most a few extra letters
// around it ("welcomex", "mypassword"), not a long passphrase that merely
// contains a common word.
function isCommon(core: string, lower: string) {
  if (COMMON_CORES.has(core) || COMMON_CORES.has(lower)) return true;
  for (const word of COMMON_CORES) {
    if (word.length >= 5 && core.includes(word) && core.length - word.length <= 4) return true;
  }
  return false;
}

function utf8Bytes(s: string) {
  return new TextEncoder().encode(s).length;
}

function hasSequence(pw: string, run = 4) {
  const lower = pw.toLowerCase();
  return SEQUENCES.some((seq) => {
    for (let i = 0; i + run <= seq.length; i++) {
      if (lower.includes(seq.slice(i, i + run))) return true;
    }
    return false;
  });
}

function hasRepeats(pw: string, run = 4) {
  return new RegExp(`(.)\\1{${run - 1},}`).test(pw);
}

function personalTokens({ name, email }: PasswordContext) {
  const tokens = new Set<string>();
  for (const part of (name ?? "").toLowerCase().split(/[^a-z0-9]+/)) {
    if (part.length >= 3) tokens.add(part);
  }
  const local = (email ?? "").toLowerCase().split("@")[0] ?? "";
  for (const part of local.split(/[^a-z0-9]+/)) {
    if (part.length >= 3) tokens.add(part);
  }
  return [...tokens];
}

export function passwordChecks(pw: string, ctx: PasswordContext = {}): PasswordCheck[] {
  const lower = pw.toLowerCase();
  const core = lower.replace(/[^a-z]/g, "");
  const tokens = personalTokens(ctx);

  return [
    { id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, ok: pw.length >= PASSWORD_MIN_LENGTH },
    { id: "lower", label: "A lowercase letter", ok: /[a-z]/.test(pw) },
    { id: "upper", label: "An uppercase letter", ok: /[A-Z]/.test(pw) },
    { id: "digit", label: "A number", ok: /\d/.test(pw) },
    { id: "symbol", label: "A symbol (e.g. ! @ # $ %)", ok: /[^A-Za-z0-9\s]/.test(pw) },
    {
      id: "common",
      label: "Not a common password",
      ok: pw.length > 0 && !isCommon(core, lower),
    },
    {
      id: "pattern",
      label: "No repeated or sequential characters (aaaa, 1234, qwer)",
      ok: pw.length > 0 && !hasRepeats(pw) && !hasSequence(pw),
    },
    {
      id: "personal",
      label: "Doesn't contain your name or email",
      ok: pw.length > 0 && !tokens.some((t) => lower.includes(t)),
    },
  ];
}

/** Returns the unmet requirements as readable messages (empty = valid). */
export function validatePassword(pw: string, ctx: PasswordContext = {}): string[] {
  const problems: string[] = [];
  if (utf8Bytes(pw) > PASSWORD_MAX_BYTES) {
    problems.push(`Must be at most ${PASSWORD_MAX_BYTES} bytes long (about ${PASSWORD_MAX_BYTES} characters).`);
  }
  for (const check of passwordChecks(pw, ctx)) {
    if (!check.ok) problems.push(check.label);
  }
  return problems;
}

/** Server-side helper: one error string for an action to return, or null. */
export function passwordError(pw: string, ctx: PasswordContext = {}): string | null {
  const problems = validatePassword(pw, ctx);
  if (problems.length === 0) return null;
  return `Password is too weak. It needs: ${problems.join("; ")}.`;
}

export type StrengthLevel = { label: string; fraction: number; tone: "weak" | "fair" | "good" | "strong" };

export function passwordStrength(pw: string, ctx: PasswordContext = {}): StrengthLevel {
  if (!pw) return { label: "", fraction: 0, tone: "weak" };
  const checks = passwordChecks(pw, ctx);
  const met = checks.filter((c) => c.ok).length;
  const allOk = met === checks.length && utf8Bytes(pw) <= PASSWORD_MAX_BYTES;
  if (allOk && pw.length >= 14) return { label: "Strong", fraction: 1, tone: "strong" };
  if (allOk) return { label: "Good", fraction: 0.75, tone: "good" };
  if (met >= checks.length - 2) return { label: "Fair", fraction: 0.5, tone: "fair" };
  return { label: "Weak", fraction: 0.25, tone: "weak" };
}
