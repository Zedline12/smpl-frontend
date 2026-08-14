import {
  ChatMessage,
  Conversation,
  MESSAGES_PAGE_SIZE,
  Paginated,
  Pagination,
} from "../types/chat";
import { CreateConversationRequest, SendMessageRequest } from "../types/api";

/**
 * The backend wraps responses in `{ success, message, timestamp, data }`, but
 * paginated payloads have been seen both nested (`json.data.data`) and hoisted
 * (`json.pagination` beside `json.data`). Unwrap defensively so the rest of the
 * feature only ever sees one shape.
 */
function unwrap<T>(json: any): T {
  return (json?.data ?? json) as T;
}

function normalizePaginated(
  json: any,
  page: number,
  limit: number,
): Paginated<ChatMessage> {
  const inner = Array.isArray(json?.data?.data) ? json.data : json;
  const data: ChatMessage[] = Array.isArray(inner?.data) ? inner.data : [];
  const pagination: Pagination = inner?.pagination ??
    json?.pagination ?? {
      page,
      limit,
      total: data.length,
      totalPages: data.length ? 1 : 0,
    };

  return { data, pagination };
}

async function readError(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => null);
  return json?.error || json?.message || fallback;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/chat/conversations");
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load conversations"));
  }
  const json = await res.json();
  const data = unwrap<Conversation[]>(json);
  return Array.isArray(data) ? data : [];
}

export async function createConversation(
  body: CreateConversationRequest = {},
): Promise<Conversation> {
  const res = await fetch("/api/chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to create conversation"));
  }
  return unwrap<Conversation>(await res.json());
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`/api/chat/conversations/${id}`, {
    method: "DELETE",
  });
  // 204, no body — never parse it.
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to delete conversation"));
  }
}

export async function fetchMessages(
  conversationId: string,
  page: number,
  limit: number = MESSAGES_PAGE_SIZE,
): Promise<Paginated<ChatMessage>> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(
    `/api/chat/conversations/${conversationId}/messages?${query.toString()}`,
  );
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to load messages"));
  }
  return normalizePaginated(await res.json(), page, limit);
}

export async function sendMessage(
  body: SendMessageRequest,
): Promise<ChatMessage> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Failed to send message"));
  }
  return unwrap<ChatMessage>(await res.json());
}
