import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createConversation,
  deleteConversation,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "../api/chat";
import { CreateConversationRequest, SendMessageRequest } from "../types/api";
import {
  ChatMessage,
  Conversation,
  MESSAGES_PAGE_SIZE,
} from "../types/chat";
import { sortConversations } from "../utils/conversation";

export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
  messages: (conversationId: string) =>
    ["chat", "messages", conversationId] as const,
};

/**
 * `GET /chat/conversations` auto-creates a conversation when the user has none,
 * so it must stay lazy: only fetch while the panel is open, never on refocus,
 * and never retry (the QueryClient has no defaultOptions, so retry would be 3).
 */
export function useConversationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: fetchConversations,
    select: sortConversations,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 0,
  });
}

/** Messages arrive newest-first, so page 1 is the bottom of the thread. */
export function useMessagesQuery(conversationId: string | null) {
  return useInfiniteQuery({
    queryKey: chatKeys.messages(conversationId ?? ""),
    queryFn: ({ pageParam }) =>
      fetchMessages(conversationId!, pageParam, MESSAGES_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = Number(lastPage.pagination.page) || 1;
      const totalPages = Number(lastPage.pagination.totalPages) || 0;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!conversationId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateConversationRequest = {}) =>
      createConversation(body),
    onSuccess: (conversation) => {
      queryClient.setQueryData<Conversation[]>(
        chatKeys.conversations,
        (old) => (old ? [conversation, ...old] : [conversation]),
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteConversation(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations, (old) =>
        old ? old.filter((conversation) => conversation.id !== id) : old,
      );
      queryClient.removeQueries({ queryKey: chatKeys.messages(id) });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Returns only the assistant message — the user's persisted message is never
 * sent back, which is why the optimistic bubble lives in component state rather
 * than in the paginated cache.
 */
export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SendMessageRequest) => sendMessage(body),
    onSuccess: (assistantMessage: ChatMessage) => {
      // Patch the list rather than invalidating it — refetching would re-hit the
      // endpoint that auto-creates conversations.
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations, (old) =>
        old
          ? old.map((conversation) =>
              conversation.id === assistantMessage.conversationId
                ? {
                    ...conversation,
                    lastMessageAt: assistantMessage.createdAt,
                    updatedAt: assistantMessage.createdAt,
                  }
                : conversation,
            )
          : old,
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
