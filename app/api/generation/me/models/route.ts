import { fetchWithToken } from "@/lib/fetcher";
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetchWithToken(`/generation/me/models`);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: json?.message || "Could not load models" },
      { status: res.status },
    );
  }
  return NextResponse.json(json?.data ?? json);
}
