import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Relays the backend's stream chunk by chunk. Handing Next the backend's body directly
 * made every dropped connection (tab closed, phone asleep, network switch) end as
 * "Error: failed to pipe response" in the error list. Here a broken read simply ends
 * the stream, and the browser leaving cancels the backend connection. EventSource
 * reconnects by itself, resuming from Last-Event-ID.
 */
function relay(upstream: ReadableStream<Uint8Array>, signal: AbortSignal): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  let done = false;
  const stop = () => {
    if (done) return;
    done = true;
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", stop, { once: true });
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done: ended } = await reader.read();
        if (ended || done) {
          done = true;
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch {
        // The backend or the network dropped: end quietly, the browser reconnects.
        stop();
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      stop();
    },
  });
}

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
    return new Response(relay(upstream.body, req.signal), {
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
