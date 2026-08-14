import { Conversation } from "../types/chat";

export function safeDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `lastMessageAt` and `title` are optional on the wire — fall back sensibly. */
export function conversationTimestamp(conversation: Conversation): Date | null {
  return (
    safeDate(conversation.lastMessageAt) ??
    safeDate(conversation.updatedAt) ??
    safeDate(conversation.createdAt)
  );
}

export function conversationTitle(conversation: Conversation): string {
  return conversation.title?.trim() || "New conversation";
}

export function sortConversations(
  conversations: Conversation[],
): Conversation[] {
  return [...conversations].sort(
    (a, b) =>
      (conversationTimestamp(b)?.getTime() ?? 0) -
      (conversationTimestamp(a)?.getTime() ?? 0),
  );
}
