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
  // The connection dropped (offline, phone switching networks): not a bug.
  /^(TypeError: )?(Load failed|Failed to fetch|fetch failed|NetworkError when attempting to fetch resource\.?)$/i,
  // Crypto-wallet extensions poking window.ethereum.
  /window\.ethereum|ethereum\.selectedAddress/i,
  // In-app browsers (Snapchat, TikTok…) inject their own bridges.
  /SCDynimacBridge|WebViewJavascriptBridge|__gCrWeb/i,
  // Safari's own video controls throwing inside its media UI.
  /Can't find variable: EmptyRanges/i,
];

/** Stack frames that belong to the browser's own UI, not to our code. */
const IGNORED_STACKS = [/^(played|buffered|syncControl|handleEvent|endTimeForBufferedRangeContainingCurrentTime)@/m];

/** Local development reports only when asked to (they used to land in production). */
function isLocal(): boolean {
  if (process.env.NEXT_PUBLIC_REPORT_LOCAL_ERRORS === "1") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
}

/** After a deploy an open tab can ask for code that no longer exists. */
export function isStaleChunkError(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null;
  return (
    e?.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      e?.message ?? "",
    )
  );
}

/**
 * Reloads once to pick up the new build. Returns true when it did; false if this tab
 * already reloaded for it in the last minute (then the chunk is really missing, and
 * the error is worth reporting).
 */
export function reloadOnStaleChunk(error: unknown): boolean {
  if (typeof window === "undefined" || !isStaleChunkError(error)) return false;
  try {
    const key = "smpl_chunk_reload";
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

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

/**
 * A readable message for anything that was thrown or rejected. Plain objects and DOM
 * events used to arrive as "Error: {}" (their properties aren't enumerable).
 */
export function describeThrown(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return String(value);
  if (typeof Event !== "undefined" && value instanceof Event) {
    const target = value.target as (Element & { src?: string; href?: string }) | null;
    const what = target?.tagName
      ? `<${target.tagName.toLowerCase()}${target.src || target.href ? ` ${target.src || target.href}` : ""}>`
      : "";
    return `${value.constructor?.name || "Event"} "${value.type}"${what ? ` on ${what}` : ""}`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const text = obj.message ?? obj.error ?? obj.reason ?? obj.statusText;
    if (typeof text === "string" && text) return text;
    const json = safeJson(value);
    if (json && json !== "{}") return json.slice(0, 500);
    const name = (value as object).constructor?.name;
    const keys = Object.getOwnPropertyNames(value).slice(0, 8);
    return `${name && name !== "Object" ? name : "Object"} thrown${keys.length ? ` (${keys.join(", ")})` : " (no details)"}`;
  }
  return String(value);
}

/** Whether a report should be dropped (noise, or not our code). */
export function shouldIgnore(message: string, stack?: string, name?: string): boolean {
  if (!message) return true;
  if (IGNORED.some((rx) => rx.test(message) || rx.test(`${name}: ${message}`))) return true;
  // Interrupted media play() and cancelled fetches: expected, not bugs.
  if (name === "AbortError") return true;
  if (stack) {
    // Browser extensions throw into the page too.
    if (/chrome-extension:|moz-extension:|safari-extension:|safari-web-extension:/.test(stack)) return true;
    if (IGNORED_STACKS.some((rx) => rx.test(stack))) return true;
  }
  return false;
}

export function reportClientError(
  error: unknown,
  info: { kind: string; digest?: string; componentStack?: string; errorId?: string } = {
    kind: "window",
  },
) {
  if (typeof window === "undefined") return;
  try {
    // An old tab after a deploy: reload once instead of reporting.
    if (reloadOnStaleChunk(error)) return;
    if (isLocal()) return;
    const e = error instanceof Error ? error : null;
    const message = describeThrown(error);
    const stack = e?.stack;
    if (shouldIgnore(message, stack, e?.name)) return;

    const key = `${e?.name}|${message}|${stack?.split("\n")[1] ?? ""}`;
    if (seen.has(key) || sent >= MAX_PER_PAGE_LOAD) return;
    seen.add(key);
    sent++;

    const body = JSON.stringify({
      name: e?.name ?? (error && typeof error === "object" ? (error as object).constructor?.name : undefined) ?? "Error",
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
