import { fetchWithToken } from "@/lib/fetcher";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/** Logs out: tells the backend first (it records the logout with the browser's details), then clears the cookies. */
export async function POST() {
  try {
    await fetchWithToken("/auth/logout", { method: "POST" });
  } catch {
    // Logging out must work even when the backend can't be reached.
  }
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("refresh_token");
  return NextResponse.json({ message: "Logged Out" });
}
