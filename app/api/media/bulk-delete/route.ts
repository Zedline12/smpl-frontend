import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetchWithToken(`/media/bulk-delete`, {
    method: "POST",
    body: JSON.stringify({ ids: body.ids }),
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not delete media" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
