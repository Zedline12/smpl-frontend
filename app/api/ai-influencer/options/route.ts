import { NextResponse } from "next/server";

const OPTIONS_URL =
  "https://api.higgsfield.ai/models/higgsfield/ai-influencer/options";

/** Proxies Higgsfield's public appearance catalog (no auth needed), cached for an hour. */
export async function GET() {
  try {
    const res = await fetch(OPTIONS_URL, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { message: "AI Influencer options are unavailable right now." },
        { status: res.status },
      );
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(
      { message: "Could not load AI Influencer options." },
      { status: 502 },
    );
  }
}
