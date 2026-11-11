import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Pipes the backend's live job stream (Server-Sent Events) to the browser.
 * EventSource can't send the auth header, so it connects here (same origin, the
 * token cookie comes along) and this adds the token. Reconnects get a fresh token.
 */
export async function GET(req: NextRequest) {
  try {
    const lastEventId = req.headers.get("last-event-id");
    const upstream = await fetchWithToken("/live/stream", {
      headers: {
        Accept: "text/event-stream",
        ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
      },
      cache: "no-store",
      // Closing the tab closes the backend connection too.
      signal: req.signal,
    });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "Live updates unavailable" }, { status: upstream.status || 502 });
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
    return NextResponse.json({ error: "Live updates unavailable" }, { status: 502 });
  }
}
