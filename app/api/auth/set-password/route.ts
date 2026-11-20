import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** A new (email code) account's first password. */
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json().catch(() => ({}));
    const res = await fetchWithToken("/auth/email/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) return new NextResponse(null, { status: 204 });
    const json = await res.json().catch(() => null);
    const message = Array.isArray(json?.message) ? json.message[0] : json?.message;
    return NextResponse.json(
      { message: typeof message === "string" ? message : "Couldn't save your password." },
      { status: res.status },
    );
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't save your password." }, { status: 502 });
  }
}
