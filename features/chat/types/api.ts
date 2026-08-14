export interface SendMessageRequest {
  /** Omit to let the backend start a new conversation. */
  conversationId?: string;
  message: string;
}

export interface CreateConversationRequest {
  title?: string;
}
