import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const res = await fetchWithToken(`/media/reference-images`);
  const data = await res.json();
  return NextResponse.json(data);
}