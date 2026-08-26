import { AppStats } from "./types";

const REVALIDATE_SECONDS = 60;

/**
 * Server-side fetch of the public `app-stats` endpoint.
 *
 * Called directly rather than through a BFF route handler: the endpoint needs
 * no auth and this runs on the server, so there is no token to attach. Avoiding
 * `lib/fetcher.ts` also keeps the request cacheable — that helper calls
 * `cookies()`, which opts the request out of the data cache.
 *
 * Returns `null` on any failure so a backend outage degrades to "no stats band"
 * rather than breaking the landing page.
 */
export async function fetchAppStats(): Promise<AppStats | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app-stats`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const data = (json?.data ?? json) as Partial<AppStats> | null;
    if (!data) return null;

    return {
      totalUsers: Number(data.totalUsers) || 0,
      totalGenerations: Number(data.totalGenerations) || 0,
      totalCreditsSpent: Number(data.totalCreditsSpent) || 0,
    };
  } catch (error) {
    console.error("Failed to load app stats:", error);
    return null;
  }
}
