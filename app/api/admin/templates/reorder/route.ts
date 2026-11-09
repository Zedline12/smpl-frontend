import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

/** Saves the display order of templates. Body: { ids } (first shows first). */
export async function POST(req: NextRequest) {
  const res = await fetchWithToken("/admin/templates/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    return NextResponse.json(
      { error: data?.message || "Could not save the order" },
      { status: res.status },
    );
  }
  return NextResponse.json({ success: true });
}
