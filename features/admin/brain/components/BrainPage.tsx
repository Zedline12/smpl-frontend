"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { fetchConversations } from "../api";
import type { ConversationPage } from "../types";
import Link from "next/link";
import { ArrowDown, ArrowLeft, Brain, Loader2, MessageSquarePlus, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrainChat } from "../useBrainChat";
import { BrainComposer, type BrainComposerHandle } from "./BrainComposer";
import { CONVERSATIONS_KEY, ConversationSidebar } from "./ConversationSidebar";
import { EmptyState } from "./EmptyState";
import { AssistantMessage, UserMessage } from "./MessageView";

// Whether the conversation column is open: a per-browser preference (open by default).
const SIDEBAR_KEY = "brain:sidebar";
const sidebarListeners = new Set<() => void>();
const readSidebar = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) !== "closed";
  } catch {
    return true;
  }
};
const writeSidebar = (open: boolean) => {
  try {
    localStorage.setItem(SIDEBAR_KEY, open ? "open" : "closed");
  } catch {
    /* storage blocked: it just won't be remembered */
  }
  sidebarListeners.forEach((l) => l());
};
const subscribeSidebar = (l: () => void) => {
  sidebarListeners.add(l);
  return () => {
    sidebarListeners.delete(l);
  };
};

function BrainChat() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlId = params.get("c");
  const qc = useQueryClient();

  const [draft, setDraft] = useState("");
  /** The title the server gave a chat created in this session (before the list has it). */
  const [newTitle, setNewTitle] = useState<{ id: string; title: string } | null>(null);
  const sidebar = useSyncExternalStore(subscribeSidebar, readSidebar, () => true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const composer = useRef<BrainComposerHandle>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const follow = useRef<"bottom" | "question" | null>("bottom");
  const programmatic = useRef(false);
  const [showJump, setShowJump] = useState(false);
  const toggleSidebar = (open: boolean) => writeSidebar(open);

  // The first page of conversations (shared with the sidebar's cache) names the open one.
  const recent = useInfiniteQuery({
    queryKey: [CONVERSATIONS_KEY, ""],
    queryFn: ({ pageParam }) => fetchConversations(pageParam, ""),
    initialPageParam: 1,
    getNextPageParam: (last: ConversationPage) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30_000,
  });

  const setUrl = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (id) next.set("c", id);
      else next.delete("c");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const chat = useBrainChat({
    onConversation: (id, t) => {
      setNewTitle({ id, title: t });
      setUrl(id);
      void qc.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] });
    },
    onSettled: () => void qc.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] }),
  });
  const { open, conversationId, current } = chat;

  // The URL decides which conversation is open (deep links, back/forward). A chat that
  // just got its id while streaming already matches, so it isn't reloaded.
  useEffect(() => {
    if (urlId === current()) return;
    follow.current = "bottom";
    void open(urlId);
  }, [urlId, current, open]);

  const title = conversationId
    ? (recent.data?.pages.flatMap((p) => p.data).find((c) => c.id === conversationId)?.title ??
      (newTitle?.id === conversationId ? newTitle.title : null))
    : null;

  // Scrolling: an opened conversation starts at its end; a new question moves to the top
  // and its answer grows below it (the admin reads from the start, "Latest" jumps down).
  // Any scroll by the admin stops the automatic scrolling.
  const nearBottom = () => {
    const el = scroller.current;
    return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  };
  const onScroll = () => {
    if (programmatic.current) programmatic.current = false;
    else follow.current = null;
    setShowJump(!nearBottom());
  };
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !follow.current) return;
    let top = el.scrollTop;
    if (follow.current === "bottom") top = el.scrollHeight;
    else {
      const questions = el.querySelectorAll<HTMLElement>("[data-user-msg]");
      const last = questions[questions.length - 1];
      if (last) top = Math.max(0, last.offsetTop - 16);
    }
    if (Math.abs(top - el.scrollTop) > 1 && el.scrollHeight > el.clientHeight) {
      programmatic.current = true;
      el.scrollTop = top;
    }
  }, [chat.messages, chat.loading]);
  // Content that grows without a scroll (streaming) can push the end out of view.
  useEffect(() => {
    const el = scroller.current?.firstElementChild;
    if (!el) return;
    const ro = new ResizeObserver(() => setShowJump(!nearBottom()));
    ro.observe(el);
    return () => ro.disconnect();
  }, [chat.messages.length, chat.loading]);
  const jump = () => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const ask = (text: string) => {
    if (!text.trim() || chat.busy) return;
    follow.current = "question";
    setDraft("");
    void chat.send(text);
  };

  const newChat = () => {
    setMobileSidebar(false);
    setDraft("");
    if (!urlId) void open(null);
    setUrl(null);
    composer.current?.focus();
  };
  const openConversation = (id: string) => {
    setMobileSidebar(false);
    if (id !== urlId) setUrl(id);
  };

  const lastUserIndex = chat.messages.map((m) => m.role).lastIndexOf("user");
  const lastAssistantIndex = chat.messages.map((m) => m.role).lastIndexOf("assistant");
  const empty = !chat.messages.length && !chat.loading && !chat.loadError;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0c0c0c]">
      {/* Conversations: a column on desktop, a drawer on phones */}
      <div className={cn("hidden md:block", !sidebar && "md:hidden")}>
        <ConversationSidebar activeId={conversationId} onOpen={openConversation} onNew={newChat} onCollapse={() => toggleSidebar(false)} />
      </div>
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <ConversationSidebar activeId={conversationId} onOpen={openConversation} onNew={newChat} onCollapse={() => setMobileSidebar(false)} />
          <button type="button" aria-label="Close conversations" className="flex-1 bg-black/60" onClick={() => setMobileSidebar(false)} />
        </div>
      )}

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.07] px-4">
          <Link
            href="/admin"
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 text-[12.5px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white"
            title="Back to admin"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to admin</span>
          </Link>
          <span className="mx-1 h-5 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => (window.matchMedia("(min-width: 768px)").matches ? toggleSidebar(true) : setMobileSidebar(true))}
            className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-white/45 hover:bg-white/[0.06] hover:text-white", sidebar && "md:hidden")}
            aria-label="Show conversations"
            title="Show conversations"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}>
            <Brain className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-white">{title || "Smpl Brain"}</p>
          </div>
          {chat.busy && (
            <span className="flex items-center gap-1.5 text-[12px] text-white/40">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Working
            </span>
          )}
          {!empty && (
            <button type="button" onClick={newChat} className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-white/55 hover:bg-white/[0.06] hover:text-white">
              <MessageSquarePlus className="h-4 w-4" /> <span className="hidden sm:inline">New chat</span>
            </button>
          )}
        </header>

        <div ref={scroller} onScroll={onScroll} data-brain-thread className="custom-scrollbar relative flex-1 overflow-y-auto">
          {empty && <EmptyState onAsk={ask} />}
          {chat.loading && (
            <div className="flex h-full items-center justify-center gap-2 text-[13px] text-white/40">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading conversation…
            </div>
          )}
          {chat.loadError && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-[13px] text-red-300/80">{chat.loadError}</p>
              <button type="button" onClick={newChat} className="rounded-lg border border-white/10 px-3 py-1.5 text-[12.5px] text-white/70 hover:text-white">
                Start a new chat
              </button>
            </div>
          )}
          {!!chat.messages.length && (
            <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 md:px-8">
              {chat.messages.map((m, i) =>
                m.role === "user" ? (
                  <UserMessage
                    key={m.id}
                    message={m}
                    onEdit={i === lastUserIndex && !chat.busy ? () => { setDraft(m.content); composer.current?.focus(); } : undefined}
                  />
                ) : (
                  <AssistantMessage
                    key={m.id}
                    message={m}
                    onRetry={!chat.busy && i === lastAssistantIndex ? () => chat.retry(m.id) : undefined}
                    onAskAgain={
                      !chat.busy && i === lastAssistantIndex && chat.messages[i - 1]?.role === "user"
                        ? () => ask(chat.messages[i - 1].content)
                        : undefined
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>

        {showJump && chat.messages.length > 0 && (
          <button
            type="button"
            onClick={jump}
            className="absolute bottom-[104px] left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-[#1b1b1b] px-3 py-1.5 text-[12px] text-white/70 shadow-lg hover:text-white"
          >
            <ArrowDown className="h-3.5 w-3.5" /> Latest
          </button>
        )}

        <BrainComposer ref={composer} value={draft} onChange={setDraft} onSubmit={() => ask(draft)} onStop={chat.stop} busy={chat.busy} />
      </div>
    </div>
  );
}

export function BrainPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center gap-2 text-[13px] text-white/40">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading Smpl Brain…
        </div>
      }
    >
      <BrainChat />
    </Suspense>
  );
}
