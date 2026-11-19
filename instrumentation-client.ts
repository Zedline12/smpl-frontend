// Runs in the browser before the app starts: reports errors nothing else caught.
import { reportClientError } from "@/lib/error-reporting";

/**
 * After a deploy, an open tab can ask for code that no longer exists. Reload once to
 * pick up the new build (the flag stops a reload loop if the chunk is really missing).
 */
function reloadOnStaleChunk(error: unknown): boolean {
  const e = error as { name?: string; message?: string } | null;
  const stale =
    e?.name === "ChunkLoadError" ||
    /Failed to load chunk|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module/i.test(
      e?.message ?? "",
    );
  if (!stale) return false;
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

window.addEventListener("error", (event) => {
  if (reloadOnStaleChunk(event.error)) return;
  reportClientError(event.error ?? event.message, { kind: "window" });
});

window.addEventListener("unhandledrejection", (event) => {
  if (reloadOnStaleChunk(event.reason)) return;
  reportClientError(event.reason, { kind: "unhandledrejection" });
});
