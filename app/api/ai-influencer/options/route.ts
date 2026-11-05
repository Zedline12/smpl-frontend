import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** The AI Influencer appearance catalog (character types, hair, skin…), served by our backend. */
export async function GET() {
  try {
    const res = await fetchWithToken("/generation/ai-influencer/options");
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: "AI Influencer options are unavailable right now." },
        { status: res.ok ? 502 : res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json.data ?? json);
  } catch {
    return NextResponse.json(
      { message: "Could not load AI Influencer options." },
      { status: 502 },
    );
  }
}
