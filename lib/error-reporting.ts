/**
 * Sends browser errors to the backend (through /api/telemetry/errors, which adds the
 * signed-in user). They show up in the maintenance app with the page, browser and
 * build. Never throws; at most 10 reports per page load, each distinct error once.
 */

const MAX_PER_PAGE_LOAD = 10;
let sent = 0;
const seen = new Set<string>();

/** Errors that aren't ours or aren't bugs. */
const IGNORED = [
  /ResizeObserver loop/i,
  /^Script error\.?$/i, // cross-origin script, no details
  /NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK/,
  /AbortError|The user aborted a request|signal is aborted/i,
];

function sessionId(): string {
  try {
    const key = "smpl_err_session";
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = newErrorId();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "no-storage";
  }
}

/** A short id to show the user ("Error ID") and find the report later. */
export function newErrorId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function reportClientError(
  error: unknown,
  info: { kind: string; digest?: string; componentStack?: string; errorId?: string } = {
    kind: "window",
  },
) {
  if (typeof window === "undefined") return;
  try {
    const e = error instanceof Error ? error : null;
    const message = e?.message ?? (typeof error === "string" ? error : safeJson(error));
    const stack = e?.stack;
    if (!message || IGNORED.some((rx) => rx.test(message))) return;
    // Interrupted media play() and cancelled fetches: expected, not bugs.
    if (e?.name === "AbortError") return;
    // Browser extensions throw into the page too.
    if (stack && /chrome-extension:|moz-extension:|safari-extension:/.test(stack)) return;

    const key = `${e?.name}|${message}|${stack?.split("\n")[1] ?? ""}`;
    if (seen.has(key) || sent >= MAX_PER_PAGE_LOAD) return;
    seen.add(key);
    sent++;

    const body = JSON.stringify({
      name: e?.name ?? "Error",
      message: message.slice(0, 4000),
      stack: stack?.slice(0, 16_000),
      url: window.location.href,
      route: window.location.pathname,
      userAgent: navigator.userAgent,
      buildId: process.env.NEXT_PUBLIC_BUILD_ID || undefined,
      kind: info.kind,
      digest: info.digest,
      componentStack: info.componentStack?.slice(0, 4000),
      requestId: info.errorId,
      sessionId: sessionId(),
      runtime: "browser",
    });
    void fetch("/api/telemetry/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* reporting must never break the page */
  }
}

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
