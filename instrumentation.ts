// Next server hooks. onRequestError reports errors thrown while rendering pages or
// running route handlers, with the signed-in user when their token cookie came along.

export async function register() {}

type RequestInfo = {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
};
type ErrorContext = { routerKind: string; routePath: string; routeType: string };

export async function onRequestError(err: unknown, request: RequestInfo, context: ErrorContext) {
  try {
    const e = err as Error & { digest?: string };
    // redirect() and notFound() are thrown on purpose.
    if (typeof e?.digest === "string" && e.digest.startsWith("NEXT_")) return;
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return;

    const cookie = String(request.headers?.cookie ?? "");
    const token = /(?:^|;\s*)token=([^;]+)/.exec(cookie)?.[1];
    await fetch(`${api}/telemetry/errors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${decodeURIComponent(token)}` } : {}),
      },
      body: JSON.stringify({
        name: e?.name ?? "Error",
        message: (e?.message ?? String(err)).slice(0, 4000),
        stack: e?.stack?.slice(0, 16_000),
        url: request.path,
        route: context.routePath,
        kind: `server:${context.routeType}`,
        digest: e?.digest,
        buildId: process.env.NEXT_PUBLIC_BUILD_ID || undefined,
        runtime: process.env.NEXT_RUNTIME ?? "nodejs",
        userAgent: String(request.headers?.["user-agent"] ?? ""),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    /* reporting must never break the response */
  }
}
