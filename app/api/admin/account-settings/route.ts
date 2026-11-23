import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Admin account defaults (sign-up bonus credits, jobs at once without a plan). */
async function forward(init?: { method: string; headers: Record<string, string>; body: string }) {
  try {
    const response = await fetchWithToken(`/admin/account-settings`, init);
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = Array.isArray(json?.message) ? json.message.join(", ") : json?.message;
      return NextResponse.json({ error: message || "Failed" }, { status: response.status });
    }
    return NextResponse.json(json?.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export function GET() {
  return forward();
}

export async function PUT(req: NextRequest) {
  const body = await req.text();
  return forward({ method: "PUT", headers: { "Content-Type": "application/json" }, body });
}
