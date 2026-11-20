import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** The signed-in user's generation and payment notifications, with the unread count. */
export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get("limit") ?? "30";
  try {
    const res = await fetchWithToken(`/me/notifications?limit=${encodeURIComponent(limit)}`);
    const json = await res.json().catch(() => null);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't load notifications." }, { status: 502 });
  }
}
