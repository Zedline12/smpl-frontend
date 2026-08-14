"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquarePlus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
} from "../hooks/use-chat";
import { Conversation } from "../types/chat";
import { conversationTimestamp, conversationTitle } from "../utils/conversation";

interface ConversationListProps {
  isOpen: boolean;
  onSelect: (id: string) => void;
}

function relativeTime(conversation: Conversation): string | null {
  const date = conversationTimestamp(conversation);
  if (!date) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

export function ConversationList({ isOpen, onSelect }: ConversationListProps) {
  const { data: conversations, isLoading, isError, error, refetch } =
    useConversationsQuery(isOpen);
  const createConversation = useCreateConversationMutation();
  const deleteConversation = useDeleteConversationMutation();

  // Inline confirm rather than an AlertDialog: the shared AlertDialog hardcodes
  // its overlay at z-50, which would render behind this panel.
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleCreate = () => {
    createConversation.mutate(
      {},
      { onSuccess: (conversation) => onSelect(conversation.id) },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-border shrink-0 border-b p-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={createConversation.isPending}
          className="bg-gradient-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createConversation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessageSquarePlus className="size-4" />
          )}
          New conversation
        </button>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
        {isLoading && (
          <ul className="divide-border divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index} className="animate-pulse px-4 py-3.5">
                <div className="bg-background-lighter h-3.5 w-2/3 rounded" />
                <div className="bg-background-light mt-2 h-2.5 w-1/4 rounded" />
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="text-muted-foreground text-sm">
              {error instanceof Error
                ? error.message
                : "Could not load your conversations."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-ghost btn-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && conversations?.length === 0 && (
          <p className="text-muted-foreground px-6 py-10 text-center text-sm">
            No conversations yet. Start one above.
          </p>
        )}

        {!isLoading && !isError && !!conversations?.length && (
          <ul className="divide-border divide-y">
            {conversations.map((conversation) => {
              const isConfirming = confirmingId === conversation.id;
              const isDeleting =
                deleteConversation.isPending &&
                deleteConversation.variables === conversation.id;
              const timestamp = relativeTime(conversation);

              return (
                <li key={conversation.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className="hover:bg-background-light flex w-full cursor-pointer flex-col items-start gap-1 px-4 py-3.5 text-left transition-colors"
                  >
                    <span className="text-foreground line-clamp-1 pr-9 text-sm font-medium">
                      {conversationTitle(conversation)}
                    </span>
                    {timestamp && (
                      <span className="text-muted-foreground text-xs">
                        {timestamp}
                      </span>
                    )}
                  </button>

                  {isConfirming ? (
                    <div className="bg-background-light absolute inset-0 flex items-center justify-end gap-2 px-4">
                      <span className="text-muted-foreground mr-auto text-xs">
                        Delete this conversation?
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-2.5 py-1 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          deleteConversation.mutate(conversation.id, {
                            onSuccess: () => setConfirmingId(null),
                          })
                        }
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete ${conversationTitle(conversation)}`}
                      onClick={() => setConfirmingId(conversation.id)}
                      className={cn(
                        "text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 transition-colors",
                        "hover:bg-background-lighter hover:text-red-400",
                        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
                      )}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
