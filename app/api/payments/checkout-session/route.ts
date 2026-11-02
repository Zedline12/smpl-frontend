import { fetchWithToken } from "@/lib/fetcher";
import { clientIpHeader } from "@/lib/client-ip";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetchWithToken(`/payments/checkout-session`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      ...clientIpHeader(req.headers),
    },
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
