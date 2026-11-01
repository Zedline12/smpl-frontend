import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetchWithToken(`/generation/calculate-cost`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json().catch(() => null);
  // Keep the backend status so callers can tell a failed price from a real one.
  return NextResponse.json(json, { status: res.status });
}
