import { unstable_rethrow } from "next/navigation";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth-tokens";

export async function POST(req: NextRequest) {
  try {
    const { exchangeToken } = await req.json().catch(() => ({}));
    if (!exchangeToken) {
      return NextResponse.json({ error: "Missing exchange token" }, { status: 400 });
    }

    const res = await fetchWithToken(`/auth/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exchangeToken }),
    });
    // Not always JSON: while the backend restarts, the host answers with an HTML error page.
    const result = await res.json().catch(() => null);
    const token = result?.data?.token;
    const refreshToken = result?.data?.refreshToken;

    if (!res.ok || !token || !refreshToken) {
      return NextResponse.json(
        { error: result?.message || "Token exchange failed" },
        { status: res.ok ? 502 : res.status },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("token", token, AUTH_COOKIE_OPTIONS);
    cookieStore.set("refresh_token", refreshToken, AUTH_COOKIE_OPTIONS);
    return NextResponse.json({ success: true });
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error exchanging auth token:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
