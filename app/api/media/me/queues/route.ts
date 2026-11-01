import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain") ?? "";
  const res = await fetchWithToken(
    `/media/me/queues?domain=${encodeURIComponent(domain)}`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
