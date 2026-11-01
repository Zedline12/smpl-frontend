export type StructuredDataType = "users" | "subscriptions" | "generations" | "media" | "analytics";

export interface StructuredDataPayload {
  type: StructuredDataType;
  items: Record<string, unknown>[];
  count?: number;
  query?: string;
}

export interface BrainMessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  structuredData?: StructuredDataPayload;
  createdAt: string;
}

export interface BrainConversation {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
}
