import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetchWithToken(`/generation/music/plan`, {
    method: "POST",
    body: JSON.stringify({ idea: body.idea, lengthMs: body.lengthMs }),
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = Array.isArray(json?.message) ? json.message[0] : json?.message;
    return NextResponse.json(
      { error: message || "Could not write the song" },
      { status: res.status },
    );
  }
  return NextResponse.json(json?.data ?? json);
}
