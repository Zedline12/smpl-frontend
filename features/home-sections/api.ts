import type { AdminHomeSection, HomePreset } from "./types";

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

/** A preset's sections (the live preset when none is given). */
export async function fetchAdminHomeSections(presetId?: string | null): Promise<AdminHomeSection[]> {
  const url = presetId ? `${BASE}?presetId=${encodeURIComponent(presetId)}` : BASE;
  return readJson<AdminHomeSection[]>(await fetch(url), "Couldn't load sections");
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

// ─── presets ──────────────────────────────────────────────────────────────────

const PRESETS = "/api/admin/home-presets";

export async function fetchHomePresets(): Promise<HomePreset[]> {
  return readJson<HomePreset[]>(await fetch(PRESETS), "Couldn't load presets");
}

export async function createHomePreset(body: {
  name: string;
  description?: string;
  copyFrom?: string | null;
}): Promise<HomePreset> {
  return readJson(
    await fetch(PRESETS, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) }),
    "Couldn't create the preset",
  );
}

export async function updateHomePreset(id: string, body: { name?: string; description?: string }): Promise<HomePreset> {
  return readJson(
    await fetch(`${PRESETS}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    }),
    "Couldn't save the preset",
  );
}

export async function activateHomePreset(id: string): Promise<HomePreset> {
  return readJson(
    await fetch(`${PRESETS}/${encodeURIComponent(id)}/activate`, { method: "POST" }),
    "Couldn't make the preset live",
  );
}

export async function deleteHomePreset(id: string): Promise<void> {
  const res = await fetch(`${PRESETS}/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) await readJson(res, "Couldn't delete the preset");
}
