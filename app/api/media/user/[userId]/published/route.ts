import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const userId = (await params).userId;
  const { searchParams } = new URL(req.url);
  const query = new URLSearchParams();
  if (searchParams.get("type")) query.set("type", searchParams.get("type")!);
  if (searchParams.get("offset"))
    query.set("offset", searchParams.get("offset")!);
  if (searchParams.get("limit")) query.set("limit", searchParams.get("limit")!);

  const res = await fetchWithToken(
    `/media/user/${userId}/published?${query}`,
    { method: "GET" },
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not fetch media" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
