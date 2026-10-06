import { validateEnv } from "@/lib/env";
import { errorFields, logger } from "@/lib/logger";

// Server-only startup work, kept out of instrumentation.ts because that file is
// also analysed for the Edge runtime, which has no process.on.
export function registerNode() {
  try {
    validateEnv();
  } catch {
    // validateEnv has already logged exactly what is wrong. Stop the process
    // instead of leaving a half-working server listening: Docker then shows the
    // crash (and the reason in the log) rather than a site that fails every page.
    process.exit(1);
  }

  process.on("unhandledRejection", (reason) => {
    logger.error("unhandled_rejection", errorFields(reason));
  });
  // "Monitor" only observes: the process still behaves as it normally would.
  process.on("uncaughtExceptionMonitor", (err) => {
    logger.error("uncaught_exception", errorFields(err));
  });

  logger.info("server_started", { env: process.env.NODE_ENV });
}
