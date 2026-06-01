import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const projectId = searchParams.get("projectId");
  const type = searchParams.get("type");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const res = await fetchWithToken(
    `/media/me?projectId=${projectId ?? ""}&type=${type}&limit=${limit ?? ""}&offset=${offset ?? ""}`,
  );
  const data = await res.json();
  return NextResponse.json(data);
}
