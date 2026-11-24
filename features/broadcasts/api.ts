import type { AdminBroadcast, BroadcastInput, PublicBroadcast } from "./types";

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error || json?.message;
    throw new Error(typeof message === "string" && message ? message : fallback);
  }
  return (json?.data ?? json) as T;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

// ─── Users ─────────────────────────────────────────────────────────────────

export async function fetchCurrentBroadcast(): Promise<PublicBroadcast | null> {
  const res = await fetch("/api/broadcasts/current", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await readJson<{ broadcast: PublicBroadcast | null }>(res, "").catch(() => null);
  return data?.broadcast ?? null;
}

/** Fire and forget: the popup must never wait on these. */
export function markBroadcastSeen(id: string): void {
  void fetch(`/api/broadcasts/${encodeURIComponent(id)}/seen`, { method: "POST", keepalive: true }).catch(() => {});
}

export function sendBroadcastAction(id: string, action: "closed" | "clicked", buttonIndex?: number): void {
  void fetch(`/api/broadcasts/${encodeURIComponent(id)}/action`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(action === "clicked" ? { action, buttonIndex } : { action }),
    keepalive: true,
  }).catch(() => {});
}

// ─── Admin ─────────────────────────────────────────────────────────────────

const ADMIN = "/api/admin/broadcasts";
const one = (id: string) => `${ADMIN}/${encodeURIComponent(id)}`;

export async function fetchAdminBroadcasts(): Promise<AdminBroadcast[]> {
  return readJson(await fetch(ADMIN, { cache: "no-store" }), "Couldn't load announcements");
}

export async function createBroadcast(body: BroadcastInput): Promise<AdminBroadcast> {
  return readJson(
    await fetch(ADMIN, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) }),
    "Couldn't create the announcement",
  );
}

export async function updateBroadcast(id: string, body: Partial<BroadcastInput>): Promise<AdminBroadcast> {
  return readJson(
    await fetch(one(id), { method: "PATCH", headers: JSON_HEADERS, body: JSON.stringify(body) }),
    "Couldn't save the announcement",
  );
}

export async function setBroadcastEnabled(id: string, enabled: boolean): Promise<AdminBroadcast> {
  return readJson(
    await fetch(`${one(id)}/${enabled ? "enable" : "disable"}`, { method: "POST" }),
    "Couldn't switch the announcement",
  );
}

export async function duplicateBroadcast(id: string): Promise<AdminBroadcast> {
  return readJson(await fetch(`${one(id)}/duplicate`, { method: "POST" }), "Couldn't duplicate");
}

export async function deleteBroadcast(id: string): Promise<void> {
  const res = await fetch(one(id), { method: "DELETE" });
  if (!res.ok) await readJson(res, "Couldn't delete the announcement");
}
