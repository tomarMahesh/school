// Structured logging: one JSON object per line on stdout/stderr, which Docker
// captures (and rotates -- see docker-compose.yml). Never pass passwords,
// tokens, cookies or request headers into these calls.

type Fields = Record<string, unknown>;

function write(level: "info" | "warn" | "error", msg: string, fields?: Fields) {
  const line = JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (msg: string, fields?: Fields) => write("info", msg, fields),
  warn: (msg: string, fields?: Fields) => write("warn", msg, fields),
  error: (msg: string, fields?: Fields) => write("error", msg, fields),
};

/** Turns any thrown value into loggable fields (message, digest, short stack). */
export function errorFields(err: unknown): Fields {
  if (err instanceof Error) {
    const digest = (err as Error & { digest?: string }).digest;
    return {
      error: err.message,
      ...(digest ? { digest } : {}),
      stack: err.stack?.split("\n").slice(0, 12).join("\n"),
    };
  }
  return { error: String(err) };
}
