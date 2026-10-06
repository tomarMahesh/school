import type { Instrumentation } from "next";
import { errorFields, logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { registerNode } = await import("./instrumentation-node");
  registerNode();
}

// Called for every error Next.js catches on the server (page renders, route
// handlers, server actions). The `digest` is the same reference code shown to
// the user on the error page, so a reported code can be searched in the logs.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  logger.error("request_error", {
    ...errorFields(err),
    // Query strings are dropped: they can hold one-time tokens. Headers are never logged.
    path: request.path.split("?")[0],
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
  });
};
