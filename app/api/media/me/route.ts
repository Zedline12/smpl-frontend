import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

const FORWARDED_PARAMS = [
  "projectId",
  "type",
  "model",
  "liked",
  "downloaded",
  "from",
  "to",
  "limit",
  "offset",
] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const params = new URLSearchParams();
  for (const key of FORWARDED_PARAMS) {
    const value = searchParams.get(key);
    if (value) params.set(key, value);
  }
  const res = await fetchWithToken(`/media/me?${params}`);
  const data = await res.json();
  return NextResponse.json(data);
}
