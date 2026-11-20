import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** Marks every notification up to now as read. */
export async function POST() {
  try {
    const res = await fetchWithToken("/me/notifications/seen", { method: "POST" });
    const json = await res.json().catch(() => null);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't update notifications." }, { status: 502 });
  }
}
