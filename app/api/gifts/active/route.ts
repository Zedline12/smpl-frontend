import { NextResponse } from "next/server";

/** The active sign-up gift (Google sign-ups), for the sign-up screen (public; cached for a minute). */
export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gifts/active`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ error: "Couldn't load the gift" }, { status: res.status });
    return NextResponse.json(json?.data ?? json, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Gift proxy error:", error);
    return NextResponse.json({ error: "Couldn't load the gift" }, { status: 502 });
  }
}
