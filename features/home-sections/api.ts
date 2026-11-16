import type { AdminHomeSection } from "./types";

/** Admin calls (through the /api/admin/home-sections proxy). The home page reads sections server-side. */

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error || json?.message;
    throw new Error(typeof message === "string" && message ? message : fallback);
  }
  return (json?.data ?? json) as T;
}

const BASE = "/api/admin/home-sections";
const JSON_HEADERS = { "Content-Type": "application/json" };

export type HomeSectionInput = Omit<AdminHomeSection, "id" | "sortOrder">;

export async function fetchAdminHomeSections(): Promise<AdminHomeSection[]> {
  return readJson<AdminHomeSection[]>(await fetch(BASE), "Couldn't load sections");
}

export async function createHomeSection(body: HomeSectionInput): Promise<AdminHomeSection> {
  return readJson(
    await fetch(BASE, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) }),
    "Couldn't add the section",
  );
}

export async function updateHomeSection(id: string, body: Partial<HomeSectionInput>): Promise<AdminHomeSection> {
  return readJson(
    await fetch(`${BASE}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    }),
    "Couldn't save the section",
  );
}

export async function duplicateHomeSection(id: string): Promise<AdminHomeSection> {
  return readJson(
    await fetch(`${BASE}/${encodeURIComponent(id)}/duplicate`, { method: "POST" }),
    "Couldn't duplicate the section",
  );
}

export async function deleteHomeSection(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) await readJson(res, "Couldn't delete the section");
}

export async function reorderHomeSections(ids: string[]): Promise<void> {
  const res = await fetch(`${BASE}/reorder`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) await readJson(res, "Couldn't reorder sections");
}
