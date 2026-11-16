import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Pipes Smpl Brain's live answer (Server-Sent Events) to the browser with the admin
 * token. Stopping in the browser aborts this request, which closes the backend
 * connection, which stops the turn.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const upstream = await fetchWithToken("/admin/brain/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body,
      cache: "no-store",
      signal: req.signal,
    });
    if (!upstream.ok || !upstream.body) {
      const json = await upstream.json().catch(() => null);
      const message = Array.isArray(json?.message) ? json.message.join(", ") : json?.message;
      return NextResponse.json({ error: message || "Smpl Brain is unavailable" }, { status: upstream.status || 502 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Smpl Brain is unavailable" }, { status: 502 });
  }
}
