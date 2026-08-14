"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  chatKeys,
  useMessagesQuery,
  useSendMessageMutation,
} from "../hooks/use-chat";
import { ChatMessage } from "../types/chat";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

/** `crypto.randomUUID` is unavailable over plain http on a LAN address. */
function temporaryId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function MessageThread({ conversationId }: { conversationId: string }) {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMessagesQuery(conversationId);
  const sendMessage = useSendMessageMutation();

  // The optimistic user bubble and the reply live here rather than in the
  // paginated cache: the send endpoint never returns the user's persisted
  // message, and writing into page 0 would collide with the offset shift.
  const [sent, setSent] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(false);

  // Drop the cached pages when leaving the thread so reopening it loads clean
  // server truth, including the messages that were only held locally.
  useEffect(
    () => () => {
      queryClient.removeQueries({ queryKey: chatKeys.messages(conversationId) });
    },
    [conversationId, queryClient],
  );

  const serverNewestFirst = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data),
    [data],
  );

  // Newest-first DOM order for the flex-col-reverse container. Deduping by id
  // absorbs the overlap caused by offset pagination shifting as messages are
  // added; the server copy always wins.
  const rendered = useMemo(() => {
    const seen = new Set<string>();
    return [...[...sent].reverse(), ...serverNewestFirst].filter((message) => {
      if (seen.has(message.id)) return false;
      seen.add(message.id);
      return true;
    });
  }, [sent, serverNewestFirst]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    armedRef.current = false;
    // Arm after the first paint so a short thread, where the sentinel is
    // visible immediately, doesn't page itself on mount.
    const frame = requestAnimationFrame(() => {
      armedRef.current = true;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || !armedRef.current) return;
        if (!hasNextPage || isFetchingNextPage) return;
        fetchNextPage();
      },
      { root, rootMargin: "160px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isLoading, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleSubmit = () => {
    const message = draft.trim();
    if (!message || sendMessage.isPending) return;

    const optimistic: ChatMessage = {
      id: temporaryId(),
      conversationId,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDraft("");
    setSent((previous) => [...previous, optimistic]);
    setIsTyping(true);
    requestAnimationFrame(scrollToBottom);

    sendMessage.mutate(
      { conversationId, message },
      {
        onSuccess: (assistantMessage) => {
          setSent((previous) => [...previous, assistantMessage]);
          setIsTyping(false);
          requestAnimationFrame(scrollToBottom);
        },
        onError: () => {
          setSent((previous) =>
            previous.filter((item) => item.id !== optimistic.id),
          );
          setIsTyping(false);
          setDraft(message);
        },
      },
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isLoading ? (
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className={`bg-background-light h-12 animate-pulse rounded-2xl ${
                index % 2 ? "ml-auto w-3/5" : "w-4/5"
              }`}
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-muted-foreground text-sm">
            {error instanceof Error
              ? error.message
              : "Could not load this conversation."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="btn btn-ghost btn-sm"
          >
            Try again
          </button>
        </div>
      ) : rendered.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 px-8 text-center">
          <p className="text-foreground text-sm font-medium">
            How can I help you?
          </p>
          <p className="text-muted-foreground text-xs">
            Ask about your credits, subscription, projects or generations.
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="custom-scrollbar flex min-h-0 flex-1 flex-col-reverse overflow-y-auto py-2"
        >
          {/* First in DOM = visual bottom. */}
          <div ref={bottomRef} />

          {isTyping && <TypingIndicator />}

          {rendered.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="text-muted-foreground size-4 animate-spin" />
            </div>
          )}

          {/* Last in DOM = visual top. */}
          <div ref={sentinelRef} className="h-px shrink-0" />
        </div>
      )}

      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        isSending={sendMessage.isPending}
      />
    </div>
  );
}
