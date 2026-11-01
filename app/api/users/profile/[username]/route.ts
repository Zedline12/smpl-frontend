import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const username = (await params).username;
  const res = await fetchWithToken(`/users/profile/${username}`, {
    method: "GET",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not fetch profile" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
