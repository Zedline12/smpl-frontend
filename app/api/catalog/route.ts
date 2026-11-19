import { NextResponse } from "next/server";

/** What we sell and our studios, as users see them (public; cached for a minute). */
export async function GET() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog`, {
      next: { revalidate: 60 },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return NextResponse.json({ error: "Couldn't load the catalog" }, { status: res.status });
    return NextResponse.json(json?.data ?? json, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("Catalog proxy error:", error);
    return NextResponse.json({ error: "Couldn't load the catalog" }, { status: 502 });
  }
}
