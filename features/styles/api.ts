import { useQuery } from "@tanstack/react-query";
import type { Style } from "./styles";

/** A style as admins see it (with the hidden prompt and status). */
export interface AdminStyle extends Style {
  prompt: string;
  sortOrder: number;
  isActive: boolean;
}

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error || json?.message;
    throw new Error(typeof message === "string" && message ? message : fallback);
  }
  return (json?.data ?? json) as T;
}

export async function fetchStyles(): Promise<Style[]> {
  return readJson<Style[]>(await fetch("/api/styles"), "Couldn't load styles");
}

/** Active styles, in order (name + thumbnail video). */
export function useStylesQuery() {
  return useQuery({ queryKey: ["styles"], queryFn: fetchStyles, staleTime: 5 * 60_000 });
}

// ─── admin ──────────────────────────────────────────────────────────────────

export async function fetchAdminStyles(): Promise<AdminStyle[]> {
  return readJson<AdminStyle[]>(await fetch("/api/admin/styles"), "Couldn't load styles");
}

export async function createStyle(body: { name: string; prompt?: string; videoUrl?: string }) {
  return readJson<AdminStyle>(
    await fetch("/api/admin/styles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    "Couldn't add the style",
  );
}

export async function updateStyle(
  id: string,
  body: Partial<Pick<AdminStyle, "name" | "prompt" | "videoUrl" | "isActive">>,
) {
  return readJson<AdminStyle>(
    await fetch(`/api/admin/styles/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    "Couldn't save the style",
  );
}

export async function deleteStyle(id: string) {
  const res = await fetch(`/api/admin/styles/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) await readJson(res, "Couldn't delete the style");
}

export async function reorderStyles(ids: string[]) {
  const res = await fetch("/api/admin/styles/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) await readJson(res, "Couldn't reorder styles");
}
