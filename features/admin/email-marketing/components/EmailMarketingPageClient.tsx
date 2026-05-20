"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SubscribedUser } from "@/features/admin/users/types/types";
import { Send, Mail, UserCheck, MailOpen, CheckSquare, Square } from "lucide-react";

const MOCK_STATS = {
  sent: 847,
  opened: 312,
  subscribed: 74,
};

async function fetchUnpaidUsers(): Promise<SubscribedUser[]> {
  const res = await fetch("/api/admin/users?isSubscribed=false");
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data;
}

function formatName(u: SubscribedUser) {
  const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return name || u.email;
}

export default function EmailMarketingPageClient() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["email-marketing-unpaid-users"],
    queryFn: fetchUnpaidUsers,
  });

  const allSelected = users.length > 0 && selected.size === users.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(users.map((u) => u.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim() || selected.size === 0) return;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const openRate = MOCK_STATS.sent > 0 ? Math.round((MOCK_STATS.opened / MOCK_STATS.sent) * 100) : 0;
  const conversionRate = MOCK_STATS.sent > 0 ? Math.round((MOCK_STATS.subscribed / MOCK_STATS.sent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-neutral-800/50 px-5 py-4 flex items-center gap-4">
          <span className="text-blue-400">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-blue-400">{MOCK_STATS.sent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sent</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-yellow-900/20 px-5 py-4 flex items-center gap-4">
          <span className="text-yellow-400">
            <MailOpen className="w-5 h-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-yellow-400">{MOCK_STATS.opened.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Opened ({openRate}%)</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-green-900/20 px-5 py-4 flex items-center gap-4">
          <span className="text-green-400">
            <UserCheck className="w-5 h-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-green-400">{MOCK_STATS.subscribed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Subscribed ({conversionRate}%)</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-neutral-800/50 px-5 py-4 flex items-center gap-4">
          <span className="text-purple-400">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-purple-400">
              {isLoading ? "—" : users.length.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Unpaid Users</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User selection */}
        <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-neutral-900/60">
            <div className="flex items-center gap-3">
              <button onClick={toggleAll} className="text-white/50 hover:text-white transition-colors">
                {allSelected ? (
                  <CheckSquare className="w-4 h-4 text-blue-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span className="text-xs text-white/40 uppercase tracking-wider font-medium">
                Unpaid Users
              </span>
            </div>
            {selected.size > 0 && (
              <span className="text-xs text-blue-400 font-medium">{selected.size} selected</span>
            )}
          </div>

          <div className="overflow-y-auto max-h-[400px] divide-y divide-white/5 bg-neutral-900">
            {isLoading && (
              <div className="py-12 text-center text-white/30 text-sm">Loading users…</div>
            )}
            {isError && (
              <div className="py-12 text-center text-red-400 text-sm">Failed to load users.</div>
            )}
            {!isLoading && !isError && users.length === 0 && (
              <div className="py-12 text-center text-white/30 text-sm">No unpaid users found.</div>
            )}
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => toggleOne(user.id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex-shrink-0 text-white/50">
                  {selected.has(user.id) ? (
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/90 truncate">{formatName(user)}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email composer */}
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-white">Compose Email</h3>

          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Special offer just for you 🎉"
              className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5 flex-1">
            <label className="text-xs text-white/40 uppercase tracking-wider">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={9}
              placeholder="Write your email here…"
              className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-white/30">
              {selected.size === 0
                ? "Select recipients on the left"
                : `Sending to ${selected.size} user${selected.size !== 1 ? "s" : ""}`}
            </p>
            <button
              onClick={handleSend}
              disabled={!subject.trim() || !body.trim() || selected.size === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white"
            >
              {sent ? (
                <>Sent!</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
