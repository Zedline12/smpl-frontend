import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

const MAX_BODY = 32 * 1024;

/** Browser error reports → the backend, with the signed-in user's token attached. */
export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text || text.length > MAX_BODY) {
      return NextResponse.json({ accepted: false }, { status: 202 });
    }
    const res = await fetchWithToken("/telemetry/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });
    return NextResponse.json({ accepted: res.ok }, { status: 202 });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ accepted: false }, { status: 202 });
  }
}
