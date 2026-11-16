import type { ActionBlock, BrainEvent, BrainMessageItem, BrainOverview, BrainConversation, ConversationPage } from "./types";

async function json<T>(res: Response, fallback: string): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || fallback);
  return body as T;
}

export async function fetchConversations(page: number, q: string): Promise<ConversationPage> {
  const params = new URLSearchParams({ page: String(page), limit: "30" });
  if (q.trim()) params.set("q", q.trim());
  return json(await fetch(`/api/admin/brain/conversations?${params}`), "Couldn't load conversations");
}

export async function fetchMessages(conversationId: string): Promise<BrainMessageItem[]> {
  const data = await json<BrainMessageItem[] | { data: BrainMessageItem[] }>(
    await fetch(`/api/admin/brain/conversations/${conversationId}/messages`),
    "Couldn't load this conversation",
  );
  return Array.isArray(data) ? data : (data?.data ?? []);
}

export async function renameConversation(id: string, title: string): Promise<BrainConversation> {
  return json(
    await fetch(`/api/admin/brain/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }),
    "Couldn't rename",
  );
}

export async function deleteConversation(id: string): Promise<void> {
  await json(await fetch(`/api/admin/brain/conversations/${id}`, { method: "DELETE" }), "Couldn't delete");
}

export async function fetchOverview(): Promise<BrainOverview> {
  return json(await fetch("/api/admin/brain/overview"), "Couldn't load the overview");
}

export async function decideAction(actionId: string, decision: "confirm" | "cancel"): Promise<ActionBlock> {
  return json(await fetch(`/api/admin/brain/actions/${actionId}/${decision}`, { method: "POST" }), "Action failed");
}

/**
 * Asks Brain and reads its Server-Sent Events as they arrive. Resolves when the stream
 * ends; aborting the signal stops the turn on the server too.
 */
export async function streamBrain(
  body: { message: string; conversationId?: string },
  onEvent: (event: BrainEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await fetch("/api/admin/brain/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || `Smpl Brain is unavailable (${res.status})`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let end: number;
    while ((end = buffer.indexOf("\n\n")) >= 0) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const data = frame
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (!data) continue; // heartbeat comment
      try {
        onEvent(JSON.parse(data) as BrainEvent);
      } catch {
        /* a malformed frame: skip it */
      }
    }
  }
}
