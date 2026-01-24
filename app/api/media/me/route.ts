import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const res = await fetchWithToken(`/media/me?projectId=${projectId}`);
  const data = await res.json();
  return NextResponse.json(data);
}
