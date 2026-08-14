export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  title?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

/** Backend caps `message` at 8000 characters (SendMessageDto). */
export const MAX_MESSAGE_LENGTH = 8000;

/** Backend caps `title` at 120 characters (CreateConversationDto). */
export const MAX_TITLE_LENGTH = 120;

export const MESSAGES_PAGE_SIZE = 25;
