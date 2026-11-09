import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Forwards a request to the backend's /user-subscriptions/{path} with the user's token. */
export async function proxyUserSubscriptions(
  req: NextRequest,
  path: string,
  method: "GET" | "POST",
) {
  try {
    const body = method === "POST" ? await req.text() : undefined;
    const response = await fetchWithToken(`/user-subscriptions/${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body } : {}),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Something went wrong with your subscription", code: data?.code },
        { status: response.status },
      );
    }
    return NextResponse.json(data ?? { success: true });
  } catch (error) {
    unstable_rethrow(error);
    console.error(`Error calling /user-subscriptions/${path}:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
