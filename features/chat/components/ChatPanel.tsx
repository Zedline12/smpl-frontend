"use client";

import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/useChatStore";
import { chatKeys } from "../hooks/use-chat";
import { Conversation } from "../types/chat";
import { conversationTitle } from "../utils/conversation";
import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";

export default function ChatPanel() {
  const queryClient = useQueryClient();
  const isOpen = useChatStore((state) => state.isOpen);
  const close = useChatStore((state) => state.close);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const activeConversation = activeConversationId
    ? queryClient
        .getQueryData<Conversation[]>(chatKeys.conversations)
        ?.find((conversation) => conversation.id === activeConversationId)
    : undefined;

  const heading = activeConversationId
    ? activeConversation
      ? conversationTitle(activeConversation)
      : "Conversation"
    : "AI Assistant";

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      modal={false}
    >
      <DialogPrimitive.Portal>
        {/* No overlay: the panel is non-modal, the page stays interactive. */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          // A non-modal Radix dialog dismisses on any outside interaction by
          // default, which would close the panel the moment the user clicks
          // the page behind it.
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className={cn(
            "bg-card border-border fixed z-[120] flex flex-col overflow-hidden shadow-2xl",
            "inset-0 h-dvh w-full",
            "sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[640px] sm:max-h-[calc(100dvh-8rem)] sm:w-[400px] sm:rounded-2xl sm:border",
            "duration-300",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right",
            "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right",
          )}
        >
          <header className="border-border bg-card flex shrink-0 items-center gap-2 border-b px-3 py-3">
            {activeConversationId ? (
              <button
                type="button"
                onClick={() => setActiveConversationId(null)}
                aria-label="Back to conversations"
                className="hover:bg-background-light text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : (
              <span
                className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #6b41ff, #ea4bff, #ff6b00)",
                }}
              >
                <Image src="/robot.png" alt="" width={18} height={18} />
              </span>
            )}

            <DialogPrimitive.Title className="text-foreground line-clamp-1 flex-1 text-sm font-semibold">
              {heading}
            </DialogPrimitive.Title>

            <DialogPrimitive.Close
              aria-label="Close AI assistant"
              className="hover:bg-background-light text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </header>

          {activeConversationId ? (
            <MessageThread
              key={activeConversationId}
              conversationId={activeConversationId}
            />
          ) : (
            <ConversationList
              isOpen={isOpen}
              onSelect={setActiveConversationId}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
