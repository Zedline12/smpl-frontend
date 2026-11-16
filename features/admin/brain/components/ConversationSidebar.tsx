"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, MessageSquarePlus, PanelLeftClose, Pencil, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { deleteConversation, fetchConversations, renameConversation } from "../api";
import type { BrainConversation, ConversationPage } from "../types";

export const CONVERSATIONS_KEY = "brain-conversations";

function groupByDate(list: BrainConversation[]) {
  const day = 86_400_000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  const groups: { label: string; items: BrainConversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const c of list) {
    const at = new Date(c.lastMessageAt ?? c.createdAt).getTime();
    groups[at >= t ? 0 : at >= t - day ? 1 : at >= t - 7 * day ? 2 : 3].items.push(c);
  }
  return groups.filter((g) => g.items.length);
}

function Row({
  conv,
  active,
  onOpen,
  onDeleted,
}: {
  conv: BrainConversation;
  active: boolean;
  onOpen: () => void;
  onDeleted: () => void;
}) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<"view" | "rename" | "confirm">("view");
  const [title, setTitle] = useState(conv.title);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode === "rename") input.current?.select();
  }, [mode]);

  const save = async () => {
    const next = title.trim();
    if (!next || next === conv.title) {
      setMode("view");
      setTitle(conv.title);
      return;
    }
    setSaving(true);
    try {
      await renameConversation(conv.id, next);
      await qc.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] });
      setMode("view");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await deleteConversation(conv.id);
      await qc.invalidateQueries({ queryKey: [CONVERSATIONS_KEY] });
      onDeleted();
    } catch (err) {
      toast.error((err as Error).message);
      setSaving(false);
      setMode("view");
    }
  };

  if (mode === "rename") {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-[#6b41ff]/40 bg-white/[0.04] px-2 py-1">
        <input
          ref={input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void save();
            if (e.key === "Escape") {
              setMode("view");
              setTitle(conv.title);
            }
          }}
          maxLength={120}
          aria-label="Conversation title"
          className="min-w-0 flex-1 border-0! bg-transparent! p-0! text-[12.5px]! text-white outline-none!"
        />
        <button type="button" onClick={() => void save()} disabled={saving} aria-label="Save title" className="rounded p-1 text-emerald-400 hover:bg-white/10">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => { setMode("view"); setTitle(conv.title); }} aria-label="Cancel" className="rounded p-1 text-white/45 hover:bg-white/10">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  if (mode === "confirm") {
    return (
      <div className="rounded-lg border border-red-400/25 bg-red-400/[0.06] px-3 py-2">
        <p className="truncate text-[12px] text-white/75">Delete “{conv.title}”?</p>
        <div className="mt-1.5 flex gap-1.5">
          <button type="button" onClick={() => void remove()} disabled={saving} className="flex items-center gap-1 rounded-md bg-red-500/80 px-2.5 py-1 text-[11.5px] font-semibold text-white hover:bg-red-500">
            {saving && <Loader2 className="h-3 w-3 animate-spin" />} Delete
          </button>
          <button type="button" onClick={() => setMode("view")} className="rounded-md px-2.5 py-1 text-[11.5px] font-medium text-white/60 hover:bg-white/10">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex items-center rounded-lg border transition-colors",
        active ? "border-[#6b41ff]/30 bg-[#6b41ff]/[0.14]" : "border-transparent hover:bg-white/[0.04]",
      )}
    >
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 truncate px-3 py-2 text-left text-[12.5px]" title={conv.title}>
        <span className={active ? "text-white/90" : "text-white/60"}>{conv.title}</span>
      </button>
      <div className="mr-1 flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button type="button" onClick={() => setMode("rename")} aria-label={`Rename ${conv.title}`} className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white">
          <Pencil className="h-3 w-3" />
        </button>
        <button type="button" onClick={() => setMode("confirm")} aria-label={`Delete ${conv.title}`} className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-red-300">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export function ConversationSidebar({
  activeId,
  onOpen,
  onNew,
  onCollapse,
}: {
  activeId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onCollapse: () => void;
}) {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const query = useInfiniteQuery({
    queryKey: [CONVERSATIONS_KEY, q],
    queryFn: ({ pageParam }) => fetchConversations(pageParam, q),
    initialPageParam: 1,
    getNextPageParam: (last: ConversationPage) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 30_000,
  });
  const list = useMemo(() => query.data?.pages.flatMap((p) => p.data) ?? [], [query.data]);
  const groups = groupByDate(list);

  return (
    <aside aria-label="Conversations" className="flex h-full w-[264px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0e0e0e]">
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          onClick={onNew}
          className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 text-[13px] font-medium text-white/85 hover:bg-white/[0.08]"
        >
          <MessageSquarePlus className="h-4 w-4 text-[#9370ff]" /> New chat
        </button>
        <button type="button" onClick={onCollapse} aria-label="Hide conversations" title="Hide conversations" className="flex h-9 w-9 items-center justify-center rounded-xl text-white/45 hover:bg-white/[0.06] hover:text-white">
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>
      <div className="px-3 pb-2">
        <label className="flex h-8 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5">
          <Search className="h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="min-w-0 flex-1 border-0! bg-transparent! p-0! text-[12.5px]! text-white outline-none! placeholder:text-white/30"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="text-white/35 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-2 pb-4">
        {query.isLoading &&
          Array.from({ length: 7 }).map((_, i) => <div key={i} className="mx-1 my-1.5 h-7 animate-pulse rounded-lg bg-white/[0.04]" />)}
        {query.isError && <p className="px-3 py-4 text-[12px] text-red-300/80">{(query.error as Error).message}</p>}
        {!query.isLoading && !list.length && !query.isError && (
          <p className="px-3 py-6 text-center text-[12px] text-white/30">{q ? "No chats match" : "No conversations yet"}</p>
        )}
        {groups.map((g) => (
          <div key={g.label} className="mb-2">
            <p className="px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/25">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((c) => (
                <Row key={c.id} conv={c} active={c.id === activeId} onOpen={() => onOpen(c.id)} onDeleted={() => c.id === activeId && onNew()} />
              ))}
            </div>
          </div>
        ))}
        {query.hasNextPage && (
          <button
            type="button"
            onClick={() => void query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="mx-1 mt-1 flex w-[calc(100%-8px)] items-center justify-center gap-1.5 rounded-lg py-2 text-[12px] font-medium text-white/45 hover:bg-white/[0.04] hover:text-white"
          >
            {query.isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Load more
          </button>
        )}
      </div>
    </aside>
  );
}
