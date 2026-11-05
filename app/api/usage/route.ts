import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Usage page data: spend totals, daily chart, per-feature totals and credit history. */
export async function GET(req: NextRequest) {
  const params = new URLSearchParams();
  for (const key of ["range", "offset", "limit"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) params.set(key, value);
  }
  try {
    const res = await fetchWithToken(`/users/usage?${params}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: json?.message ?? "Usage is unavailable right now." },
        { status: res.ok ? 502 : res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json.data ?? json);
  } catch {
    return NextResponse.json({ message: "Could not load usage." }, { status: 502 });
  }
}
