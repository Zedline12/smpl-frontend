"use client";

import React, { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, CheckCircle2, Search, Paperclip, Receipt, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportTicketDrawer } from "./SupportTicketDrawer";
import type {
  SupportCategoryKey,
  SupportGeneration,
  SupportInvoice,
  SupportPriority,
  SupportStatus,
} from "@/features/support/types";
import { STATUS_LABELS, timeAgo } from "@/features/support/types";

export interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface SupportTicket {
  _id: string;
  userId: PopulatedUser | null;
  supportCode: string;
  category: string;
  categoryLabel: string;
  topic: string | null;
  priority: SupportPriority;
  status: SupportStatus;
  body: string;
  attachments: { url: string; key: string }[];
  invoice: SupportInvoice | null;
  generations: SupportGeneration[];
  lastMessageAt: string;
  adminUnread: boolean;
  createdAt: string;
}

const STATUS_TABS: { label: string; status?: SupportStatus }[] = [
  { label: "Open", status: "open" },
  { label: "Waiting on user", status: "waiting_on_user" },
  { label: "Resolved", status: "resolved" },
  { label: "All" },
];

const CATEGORY_OPTIONS: { value: "" | SupportCategoryKey; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "billing", label: "Billing" },
  { value: "generations", label: "Generations" },
  { value: "credits", label: "Credits" },
  { value: "account", label: "Account & login" },
  { value: "other", label: "Bug / other" },
];

const PRIORITY_OPTIONS: { value: "" | SupportPriority; label: string }[] = [
  { value: "", label: "Any priority" },
  { value: "high", label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
];

async function fetchTickets(params: { status?: SupportStatus; category?: string; priority?: string; page: number }) {
  const search = new URLSearchParams({ page: String(params.page), limit: "50" });
  if (params.status) search.set("status", params.status);
  if (params.category) search.set("category", params.category);
  if (params.priority) search.set("priority", params.priority);
  const res = await fetch(`/api/admin/support?${search}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json() as Promise<{ data: SupportTicket[]; pagination: { total: number; totalPages: number } | null }>;
}

function getUserName(user?: PopulatedUser | null) {
  if (!user) return "—";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "—";
}

export function PriorityBadge({ priority }: { priority: SupportPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
        priority === "high" && "bg-red-500/15 text-red-300",
        priority === "normal" && "bg-white/[0.08] text-white/60",
        priority === "low" && "bg-white/[0.04] text-white/35",
      )}
    >
      {priority}
    </span>
  );
}

export function AdminStatusPill({ status }: { status: SupportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "open" && "bg-amber-400/12 text-amber-300",
        status === "waiting_on_user" && "bg-sky-400/12 text-sky-300",
        status === "resolved" && "bg-emerald-400/12 text-emerald-300",
      )}
    >
      {status === "waiting_on_user" ? "Waiting on user" : STATUS_LABELS[status]}
    </span>
  );
}

const selectClass =
  "rounded-xl border border-white/[0.09] bg-white/[0.05] px-3 py-2 text-[13px] text-white/75 focus:outline-none";

export function SupportAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategoryState] = useState("");
  const [priority, setPriorityState] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // The open ticket lives in the URL, so notification links open it directly.
  const selectedId = searchParams.get("ticket");
  const setSelectedId = (id: string | null) =>
    router.replace(id ? `${pathname}?ticket=${encodeURIComponent(id)}` : pathname, { scroll: false });

  // Changing a filter goes back to the first page.
  const setActiveTab = (i: number) => {
    setTab(i);
    setPage(1);
  };
  const setCategory = (v: string) => {
    setCategoryState(v);
    setPage(1);
  };
  const setPriority = (v: string) => {
    setPriorityState(v);
    setPage(1);
  };

  const status = STATUS_TABS[activeTab].status;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-support", status, category, priority, page],
    queryFn: () => fetchTickets({ status, category, priority, page }),
  });

  const { data: highOpen } = useQuery({
    queryKey: ["admin-support", "high-open-count"],
    queryFn: () => fetchTickets({ status: "open", priority: "high", page: 1 }),
    select: (d) => d.pagination?.total ?? 0,
  });

  const allTickets = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  // Client-side search by name, email, or support code
  const tickets = search.trim()
    ? allTickets.filter((t) => {
        const q = search.toLowerCase();
        return (
          (t.userId?.email?.toLowerCase() ?? "").includes(q) ||
          getUserName(t.userId).toLowerCase().includes(q) ||
          (t.supportCode?.toLowerCase() ?? "").includes(q)
        );
      })
    : allTickets;

  const cols = "grid-cols-[1.1fr_1.8fr_1.8fr_0.8fr_0.9fr_1fr]";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
          <LifeBuoy className="size-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white">Support</h2>
          <p className="text-[13px] text-white/40">
            {total} ticket{total !== 1 ? "s" : ""}
            {status ? ` ${status === "waiting_on_user" ? "waiting on user" : status}` : ""}
          </p>
        </div>
        {!!highOpen && (
          <button
            onClick={() => {
              setActiveTab(0);
              setPriority("high");
            }}
            className="rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-[12px] font-semibold text-red-300"
          >
            {highOpen} high priority open
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl bg-white/[0.05] p-1">
          {STATUS_TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all",
                activeTab === i ? "bg-white/[0.12] text-white" : "text-white/45 hover:text-white/70",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs min-w-[200px] flex-1">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name or code…"
            className="w-full rounded-xl border border-white/[0.09] bg-white/[0.05] py-2 pr-3 pl-8 text-[13px] text-white/85 focus:outline-none"
          />
        </div>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-neutral-900">
              {o.label}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
          {PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-neutral-900">
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
        <div className="min-w-[860px]">
          <div
            className={cn(
              "grid border-b border-white/[0.07] bg-white/[0.04] px-4 py-2.5 text-[11px] font-bold tracking-wider text-white/30 uppercase",
              cols,
            )}
          >
            <span>Code</span>
            <span>User</span>
            <span>Issue</span>
            <span>Priority</span>
            <span>Updated</span>
            <span>Status</span>
          </div>

          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={cn("grid gap-3 border-b border-white/[0.04] px-4 py-3.5", cols)}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-4 animate-pulse rounded-md bg-white/[0.06]" />
                ))}
              </div>
            ))
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-[14px] text-red-400">Failed to load tickets</p>
              <p className="mt-1 text-[12px] text-white/30">{String(error)}</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 className="mx-auto mb-3 size-10 text-white/15" />
              <p className="text-[14px] text-white/30">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <button
                key={ticket._id}
                onClick={() => setSelectedId(ticket._id)}
                className={cn(
                  "grid w-full border-b border-white/[0.04] px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]",
                  cols,
                )}
              >
                <span className="flex items-center gap-2 self-center">
                  <span className={cn("size-1.5 rounded-full", ticket.adminUnread ? "bg-white" : "bg-transparent")} />
                  <span className="font-mono text-[12px] font-semibold text-white/80">{ticket.supportCode}</span>
                </span>
                <div className="min-w-0 self-center">
                  <p className="truncate text-[13px] font-medium text-white">{getUserName(ticket.userId)}</p>
                  <p className="truncate text-[11px] text-white/35">{ticket.userId?.email ?? ""}</p>
                </div>
                <div className="min-w-0 self-center">
                  <p className="truncate text-[12px] text-white/75">{ticket.categoryLabel}</p>
                  <p className="flex items-center gap-2 truncate text-[11px] text-white/35">
                    {ticket.invoice && (
                      <span className="flex items-center gap-0.5">
                        <Receipt className="size-3" />
                        {(ticket.invoice.amount / 100).toFixed(2)} {ticket.invoice.currency?.toUpperCase()}
                      </span>
                    )}
                    {ticket.generations?.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Sparkles className="size-3" />
                        {ticket.generations.length}
                      </span>
                    )}
                    {ticket.attachments?.length > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Paperclip className="size-3" />
                        {ticket.attachments.length}
                      </span>
                    )}
                    {!ticket.invoice && !ticket.generations?.length && <span className="truncate">{ticket.body}</span>}
                  </p>
                </div>
                <span className="self-center">
                  <PriorityBadge priority={ticket.priority} />
                </span>
                <span className="self-center text-[12px] text-white/40">{timeAgo(ticket.lastMessageAt)}</span>
                <span className="self-center">
                  <AdminStatusPill status={ticket.status} />
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-[13px] text-white/50">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg bg-white/[0.05] px-3 py-1.5 disabled:opacity-30"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg bg-white/[0.05] px-3 py-1.5 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}

      {selectedId && (
        <SupportTicketDrawer
          ticketId={selectedId}
          onClose={() => {
            setSelectedId(null);
            queryClient.invalidateQueries({ queryKey: ["admin-support"] });
          }}
          onChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-support"] })}
        />
      )}
    </div>
  );
}
