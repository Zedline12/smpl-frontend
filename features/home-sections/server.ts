import { fetchWithToken } from "@/lib/fetcher";
import type { PublicHomeSection } from "./types";

/**
 * The home page's sections for this viewer (server-side; the token decides the
 * audience). `preset` / `as` are previews, honoured by the backend for admins only.
 * An error just means no sections.
 */
export async function getHomeSections(preview: { preset?: string; as?: string } = {}): Promise<PublicHomeSection[]> {
  try {
    const q = new URLSearchParams();
    if (preview.preset) q.set("preset", preview.preset);
    if (preview.as) q.set("as", preview.as);
    const res = await fetchWithToken(`/home-sections${q.size ? `?${q}` : ""}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
