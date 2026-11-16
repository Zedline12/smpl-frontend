import { fetchWithToken } from "@/lib/fetcher";
import type { PublicHomeSection } from "./types";

/** The home page's custom sections (server-side). An error just means no sections. */
export async function getHomeSections(): Promise<PublicHomeSection[]> {
  try {
    const res = await fetchWithToken("/home-sections", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
