// Whether administrators must pass the SMS-code second step when signing in.
// Controlled by TWO_FACTOR_AUTH in .env and read on every use (restart the
// server after changing it). Fail-safe: anything other than an explicit
// "false" / "0" / "no" / "off" keeps two-factor ON, so a typo or a missing
// line can never silently weaken admin security.
const OFF = new Set(["false", "0", "no", "off"]);
const ON = new Set(["", "true", "1", "yes", "on"]);

function raw() {
  return (process.env.TWO_FACTOR_AUTH ?? "").trim().toLowerCase();
}

export function twoFactorEnabled(): boolean {
  return !OFF.has(raw());
}

/** False for values like "flase", which therefore leave two-factor on. */
export function twoFactorSettingRecognized(): boolean {
  return OFF.has(raw()) || ON.has(raw());
}
