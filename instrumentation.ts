/**
 * Next.js instrumentation (runs once per server process).
 *  - register(): fail fast on missing/placeholder production secrets.
 *  - onRequestError(): central error tracking hook for every server-side error. Forward to Sentry /
 *    Datadog / Logtail here; by default emits structured, redacted JSON logs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertProductionEnv } = await import("./lib/env");
    assertProductionEnv();
  }
}

export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  const { logger } = await import("./lib/logger");
  logger.error("unhandled server error", err, {
    method: request.method,
    path: request.path.split("?")[0], // never log query strings (may contain tokens)
    route: context.routePath,
    routeType: context.routeType,
  });
}
