import { logger } from "@/lib/logger";
import { twoFactorEnabled, twoFactorSettingRecognized } from "@/lib/twoFactorConfig";

// Checked once when the production server starts. Missing core secrets stop
// the server with a clear message (instead of failing later in odd ways);
// weaker setups only produce warnings in the log.
export function validateEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const problems: string[] = [];
  const warnings: string[] = [];
  const env = process.env;

  if (!env.DATABASE_URL) problems.push("DATABASE_URL is not set.");
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) {
    problems.push("AUTH_SECRET must be set to a random value of at least 32 characters.");
  }
  if (!env.DATA_ENCRYPTION_KEY || !/^[0-9a-fA-F]{64}$/.test(env.DATA_ENCRYPTION_KEY)) {
    problems.push("DATA_ENCRYPTION_KEY must be exactly 64 hex characters.");
  }

  if (!env.APP_URL?.startsWith("https://")) {
    warnings.push("APP_URL is not an https:// address; emailed links may be wrong or insecure.");
  }
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    warnings.push("SMTP is not configured; password setup and reset emails cannot be sent.");
  }
  if (!twoFactorSettingRecognized()) {
    warnings.push(`TWO_FACTOR_AUTH="${env.TWO_FACTOR_AUTH}" is not recognised, so two-factor stays ON. Use true or false.`);
  }
  if (!twoFactorEnabled()) {
    warnings.push(
      "TWO_FACTOR_AUTH=false: administrators can sign in with a password ALONE. Turn it back on as soon as SMS is working.",
    );
  } else {
    const sms = (env.SMS_PROVIDER ?? "console").toLowerCase();
    if (sms === "console") {
      warnings.push("SMS_PROVIDER is 'console'; admin sign-in codes cannot be sent in production.");
    }
  }

  for (const message of warnings) logger.warn("config_warning", { message });

  if (problems.length > 0) {
    logger.error("config_invalid", { problems });
    throw new Error(`Invalid configuration: ${problems.join(" ")}`);
  }
}
