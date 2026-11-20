import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

// Waits for the generated image (~25 s; the backend gives up at 60 s).
export const maxDuration = 90;

/** Makes the signed-in user's avatar (email sign-up's last step). `{ avatarUrl }`, null when none was made. */
export async function POST() {
  try {
    const res = await fetchWithToken("/users/me/avatar", { method: "POST" });
    const json = await res.json().catch(() => null);
    const body = json?.data ?? json;
    return NextResponse.json({ avatarUrl: body?.avatarUrl ?? null }, { status: res.ok ? 200 : res.status });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ avatarUrl: null }, { status: 502 });
  }
}
