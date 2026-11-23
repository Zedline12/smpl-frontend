import { NextResponse } from "next/server";

/** The Artist Video Clip picks and ready-made videos (public; cached for a minute). */
export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artist-clip-scenes`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ error: "Couldn't load the clip scenes" }, { status: res.status });
    return NextResponse.json(json?.data ?? json, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Clip scenes proxy error:", error);
    return NextResponse.json({ error: "Couldn't load the clip scenes" }, { status: 502 });
  }
}
