import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Suspended users have no login, only the support token issued at sign-in.
    const hasSession = !!req.cookies.get("token")?.value;
    const suspendedToken = hasSession ? undefined : req.cookies.get("suspended_token")?.value;

    const response = suspendedToken
      ? await fetch(`${process.env.NEXT_PUBLIC_API_URL}/support/suspended`, {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            "Content-Type": "application/json",
            "x-suspended-token": suspendedToken,
          },
        })
      : await fetchWithToken("/support", {
          method: "POST",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ error: data?.message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(data?.data ?? data);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
