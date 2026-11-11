"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LifeBuoy, Loader2, Plus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, SettingsHeader, SettingsPanel, SettingsTile } from "@/app/(protected)/(other)/me/settings/_components/SettingsUi";
import { fetchMyTicket, fetchMyTickets, replyToTicket } from "../api";
import { STATUS_LABELS, SupportStatus, timeAgo } from "../types";
import { SupportModal } from "./SupportModal";
import { ScreenshotsField } from "./ScreenshotsField";
import { MessageList, TicketContext } from "./TicketThread";

export function StatusPill({ status }: { status: SupportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "open" && "bg-amber-400/15 text-amber-300",
        status === "waiting_on_user" && "bg-sky-400/15 text-sky-300",
        status === "resolved" && "bg-emerald-400/15 text-emerald-300",
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function MyTicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("ticket");
  const [newOpen, setNewOpen] = useState(false);

  const select = (code: string | null) =>
    router.replace(code ? `/me/settings/support?ticket=${encodeURIComponent(code)}` : "/me/settings/support", {
      scroll: false,
    });

  return (
    <div>
      <SettingsHeader
        title="Support"
        subtitle="Your tickets and our replies."
        actions={
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black hover:opacity-90"
          >
            <Plus className="size-4" /> New ticket
          </button>
        }
      />
      {selected ? <TicketDetail code={selected} onBack={() => select(null)} /> : <TicketList onOpen={select} />}
      <SupportModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
}

function TicketList({ onOpen }: { onOpen: (code: string) => void }) {
  const { data, isLoading, error } = useQuery({ queryKey: ["my-support-tickets"], queryFn: fetchMyTickets });

  return (
    <SettingsPanel icon={LifeBuoy} title="Your tickets">
      {isLoading ? (
        [0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />)
      ) : error ? (
        <SettingsTile className="text-sm text-red-400">{(error as Error).message}</SettingsTile>
      ) : !data?.length ? (
        <EmptyState icon={LifeBuoy} title="No tickets yet" text="When you contact support, your tickets show up here." />
      ) : (
        data.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpen(t.supportCode)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.07]"
          >
            <span className={cn("size-2 shrink-0 rounded-full", t.userUnread ? "bg-white" : "bg-transparent")} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white/50">{t.supportCode}</span>
                <span className="truncate text-sm font-semibold text-white">{t.categoryLabel}</span>
              </div>
              <p className="truncate text-xs text-white/45">{t.preview || "No message"}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <StatusPill status={t.status} />
              <span className="text-[11px] text-white/35">{timeAgo(t.lastMessageAt)}</span>
            </div>
          </button>
        ))
      )}
    </SettingsPanel>
  );
}

function TicketDetail({ code, onBack }: { code: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const onAttachments = useCallback((keys: string[]) => setAttachments(keys), []);
  const [now] = useState(() => Date.now());

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["my-support-ticket", code],
    queryFn: async () => {
      const t = await fetchMyTicket(code);
      // Opening marks it read.
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      return t;
    },
  });

  const reply = useMutation({
    mutationFn: () => replyToTicket(code, body.trim(), attachments),
    onSuccess: (t) => {
      queryClient.setQueryData(["my-support-ticket", code], t);
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      setBody("");
      setAttachments([]);
      setResetKey((k) => k + 1);
    },
  });

  const closedLongAgo =
    ticket?.status === "resolved" &&
    !!ticket.resolvedAt &&
    now - new Date(ticket.resolvedAt).getTime() > 14 * 24 * 60 * 60 * 1000;

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="size-4" /> All tickets
      </button>
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : error || !ticket ? (
        <SettingsTile className="text-sm text-red-400">{(error as Error)?.message ?? "Ticket not found"}</SettingsTile>
      ) : (
        <SettingsPanel
          title={`${ticket.supportCode} · ${ticket.categoryLabel}`}
          action={<StatusPill status={ticket.status} />}
        >
          <div className="space-y-4 px-2 pb-2">
            <TicketContext topic={ticket.topic} invoice={ticket.invoice} generations={ticket.generations} />
            <MessageList messages={ticket.messages} viewer="user" />

            {closedLongAgo ? (
              <p className="rounded-xl bg-white/[0.04] p-3 text-xs text-white/45">
                This ticket was closed a while ago. Open a new ticket if you still need help.
              </p>
            ) : (
              <div className="space-y-3 rounded-xl border border-white/[0.08] p-3">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  maxLength={5000}
                  placeholder={ticket.status === "resolved" ? "Reply to reopen this ticket…" : "Write a reply…"}
                  className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white/85 focus:border-white/30 focus:outline-none"
                />
                <ScreenshotsField key={resetKey} onChange={onAttachments} onUploadingChange={setUploading} />
                {reply.error && <p className="text-xs text-red-400">{(reply.error as Error).message}</p>}
                <div className="flex justify-end">
                  <button
                    onClick={() => reply.mutate()}
                    disabled={!body.trim() || uploading || reply.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-30"
                  >
                    {reply.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </SettingsPanel>
      )}
    </div>
  );
}
