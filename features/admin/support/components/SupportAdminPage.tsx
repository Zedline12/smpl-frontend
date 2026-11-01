"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, Clock, CheckCircle2, Search, ChevronDown } from "lucide-react";
import { SupportTicketDrawer } from "./SupportTicketDrawer";

type SupportStatus = "open" | "resolved";

export interface PopulatedUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  avatarUrl?: string;
}

export interface PopulatedCategory {
  _id: string;
  slug: string;
  label: string;
}

export interface SupportTicket {
  _id: string;
  userId: PopulatedUser;
  categoryId: PopulatedCategory;
  body: string;
  supportCode: string;
  status: SupportStatus;
  adminReply?: string;
  replySentAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

const TABS: { label: string; status?: SupportStatus }[] = [
  { label: "All" },
  { label: "Open", status: "open" },
  { label: "Resolved", status: "resolved" },
];

async function fetchTickets(status?: SupportStatus, categoryId?: string, page = 1) {
  const params = new URLSearchParams({ page: String(page), limit: "50" });
  if (status) params.set("status", status);
  if (categoryId) params.set("categoryId", categoryId);
  const res = await fetch(`/api/admin/support?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch("/api/support/categories");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data?.data ?? [];
}

function getUserName(user?: PopulatedUser) {
  if (!user) return "—";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "—";
}

export function SupportAdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [catOpen, setCatOpen] = useState(false);
  const queryClient = useQueryClient();

  const status = TABS[activeTab].status;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-support", status, categoryFilter],
    queryFn: () => fetchTickets(status, categoryFilter || undefined),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["support-categories"],
    queryFn: fetchCategories,
  });
  const allTickets: SupportTicket[] = data ?? [];
  const total: number = data?.pagination?.total ?? 0;

  // Client-side search by name, email, or support code
  const tickets = search.trim()
    ? allTickets.filter((t) => {
        const q = search.toLowerCase();
        const email = t.userId?.email?.toLowerCase() ?? "";
        const name = getUserName(t.userId).toLowerCase();
        const code = t.supportCode?.toLowerCase() ?? "";
        return email.includes(q) || name.includes(q) || code.includes(q);
      })
    : allTickets;

  const selectedCategory = categories.find((c: any) => c.id === categoryFilter || c._id === categoryFilter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
        >
          <LifeBuoy className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Support</h2>
          <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {total} ticket{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={
                activeTab === i
                  ? { background: "rgba(107,65,255,0.25)", color: "#b89dff" }
                  : { color: "rgba(255,255,255,0.45)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name or code…"
            className="w-full pl-8 pr-3 py-2 rounded-xl text-[13px] bg-transparent focus:outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(255,255,255,0.85)",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => setCatOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium"
            style={{
              background: categoryFilter ? "rgba(107,65,255,0.18)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${categoryFilter ? "rgba(107,65,255,0.35)" : "rgba(255,255,255,0.09)"}`,
              color: categoryFilter ? "#b89dff" : "rgba(255,255,255,0.55)",
            }}
          >
            {selectedCategory ? (selectedCategory as any).label : "All Categories"}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {catOpen && (
            <div
              className="absolute top-full mt-1 left-0 z-50 rounded-xl overflow-hidden min-w-[180px]"
              style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <button
                onClick={() => { setCategoryFilter(""); setCatOpen(false); }}
                className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 transition-colors"
                style={{ color: !categoryFilter ? "#b89dff" : "rgba(255,255,255,0.7)" }}
              >
                All Categories
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id ?? cat._id}
                  onClick={() => { setCategoryFilter(cat.id ?? cat._id); setCatOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[13px] hover:bg-white/5 transition-colors"
                  style={{ color: categoryFilter === (cat.id ?? cat._id) ? "#b89dff" : "rgba(255,255,255,0.7)" }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span>Code</span>
          <span>User</span>
          <span>Category</span>
          <span>Date</span>
          <span>Status</span>
        </div>

        {isLoading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] px-4 py-3.5 gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="h-4 rounded-md animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
                ))}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-red-400">Failed to load tickets</p>
            <p className="text-[12px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{String(error)}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.15)" }} />
            <p className="text-[14px]" style={{ color: "rgba(255,255,255,0.3)" }}>No tickets found</p>
          </div>
        ) : (
          <div>
            {tickets.map((ticket) => {
              const userName = getUserName(ticket.userId);
              const userEmail = ticket.userId?.email ?? "";
              const categoryLabel = ticket.categoryId?.label ?? ticket.categoryId?.slug ?? "—";

              return (
                <button
                  key={ticket._id}
                  onClick={() => setSelectedId(ticket._id)}
                  className="w-full grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] px-4 py-3.5 text-left transition-colors"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <span className="font-mono text-[12px] font-semibold self-center" style={{ color: "#9370ff" }}>
                    {ticket.supportCode}
                  </span>
                  <div className="min-w-0 self-center">
                    <p className="text-[13px] text-white font-medium truncate">{userName}</p>
                    <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{userEmail}</p>
                  </div>
                  <span className="text-[12px] self-center" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {categoryLabel}
                  </span>
                  <span className="text-[12px] self-center" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span className="self-center">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      style={
                        ticket.status === "open"
                          ? { background: "rgba(234,179,8,0.12)", color: "#fbbf24" }
                          : { background: "rgba(34,197,94,0.12)", color: "#4ade80" }
                      }
                    >
                      {ticket.status === "open" ? <Clock className="w-2.5 h-2.5" /> : <CheckCircle2 className="w-2.5 h-2.5" />}
                      {ticket.status === "open" ? "Open" : "Resolved"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedId && (
        <SupportTicketDrawer
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
          onAction={() => {
            setSelectedId(null);
            queryClient.invalidateQueries({ queryKey: ["admin-support"] });
          }}
        />
      )}
    </div>
  );
}
