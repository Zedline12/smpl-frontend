import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/**
 * A generation's price in credits before Generate (`{ input }` in the body).
 * Keeps the backend status, so callers can tell "not set up" from a real price.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  const body = await req.json().catch(() => ({}));
  try {
    const res = await fetchWithToken(`/credits/estimate/${encodeURIComponent(model)}`, {
      method: "POST",
      body: JSON.stringify({ input: body?.input ?? {} }),
      headers: { "Content-Type": "application/json" },
    });
    const json = await res.json().catch(() => null);
    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't price this generation." }, { status: 502 });
  }
}
