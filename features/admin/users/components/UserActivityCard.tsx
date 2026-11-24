"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 30;

interface ActivityRow {
  id: string;
  action: string;
  at: string;
  method: string | null;
  ip: string | null;
  userAgent: string | null;
  browser: { name: string; version?: string | null } | null;
  os: { name: string; version?: string | null } | null;
  device: { type?: string | null; vendor?: string | null; model?: string | null } | null;
  location: { city?: string | null; region?: string | null; country?: string | null; countryCode?: string | null } | null;
  network: { isVpn?: boolean; isProxy?: boolean; isDataCenter?: boolean } | null;
  refs: Record<string, string | number> | null;
  meta: Record<string, unknown> | null;
  contextFromCheckout?: boolean;
}

interface Page {
  data: ActivityRow[];
  total: number;
  page: number;
  limit: number;
}

const ACTIONS: Record<string, { label: string; tone: string }> = {
  signup: { label: "Signed up", tone: "text-emerald-300" },
  login: { label: "Signed in", tone: "text-sky-300" },
  login_blocked: { label: "Sign-in blocked (suspended)", tone: "text-red-300" },
  logout: { label: "Signed out", tone: "text-white/60" },
  session_refresh: { label: "Session active", tone: "text-white/45" },
  checkout_started: { label: "Opened checkout", tone: "text-white/75" },
  subscribed: { label: "Subscribed", tone: "text-emerald-300" },
  credit_pack_bought: { label: "Bought credits", tone: "text-emerald-300" },
  plan_changed: { label: "Changed plan", tone: "text-violet-300" },
  cancel_scheduled: { label: "Canceled plan", tone: "text-amber-300" },
  cancel_undone: { label: "Kept plan", tone: "text-sky-300" },
  refund_cancel: { label: "Refund and cancel", tone: "text-red-300" },
  billing_portal_opened: { label: "Opened billing", tone: "text-white/60" },
  account_deleted: { label: "Deleted account", tone: "text-red-300" },
  support_ticket_opened: { label: "Contacted support", tone: "text-white/75" },
};

async function fetchActivity(userId: string, action: string, page: number): Promise<Page> {
  const q = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), ...(action ? { action } : {}) });
  const res = await fetch(`/api/admin/users/${userId}/activity?${q}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Couldn't load the activity.");
  return json as Page;
}

const DeviceIcon = ({ type }: { type?: string | null }) =>
  type === "mobile" ? <Smartphone className="size-3.5" /> : type === "tablet" ? <Tablet className="size-3.5" /> : <Monitor className="size-3.5" />;

function detail(r: ActivityRow): string | null {
  const m = r.meta ?? {};
  const refs = r.refs ?? {};
  if (r.action === "cancel_scheduled" || r.action === "refund_cancel") return (m.feedback as string) ?? null;
  if (r.action === "checkout_started") return [m.planName, m.credits ? `${m.credits} credits` : null].filter(Boolean).join(" · ") || r.method;
  if (r.action === "credit_pack_bought") return [m.packName, m.credits ? `${m.credits} credits` : null].filter(Boolean).join(" · ") || null;
  if (r.action === "support_ticket_opened") return (refs.ticketCode as string) ?? null;
  if (r.action === "plan_changed" && m.promotionCode) return `Code ${m.promotionCode}`;
  return null;
}

/** Admin user page: sign-ins, payments and plan actions with browser, device, IP and location. */
export function UserActivityCard({ userId }: { userId: string }) {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["admin", "user-activity", userId, action, page],
    queryFn: () => fetchActivity(userId, action, page),
    placeholderData: keepPreviousData,
  });
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            Activity {isFetching && <Loader2 className="size-3.5 animate-spin text-white/40" />}
          </h2>
          <p className="text-xs text-white/40">Kept 3 years. Used as evidence if a payment is disputed.</p>
        </div>
        <select
          value={action}
          onChange={(e) => (setAction(e.target.value), setPage(1))}
          className="h-9 rounded-lg border border-white/[0.08] bg-[#161616] px-3 text-[13px] text-white"
        >
          <option value="">All actions</option>
          {Object.entries(ACTIONS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="bg-white/[0.02] text-[11px] tracking-wide text-white/40 uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Browser · OS</th>
              <th className="px-3 py-2 font-medium">IP · location</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-red-300">
                  {(error as Error).message}
                </td>
              </tr>
            )}
            {data?.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-white/40">
                  Nothing recorded yet.
                </td>
              </tr>
            )}
            {data?.data.map((r) => {
              const a = ACTIONS[r.action] ?? { label: r.action, tone: "text-white/70" };
              const extra = detail(r);
              const place = [r.location?.city, r.location?.country].filter(Boolean).join(", ");
              const flags = [r.network?.isVpn && "VPN", r.network?.isProxy && "Proxy", r.network?.isDataCenter && "Data center"].filter(Boolean);
              return (
                <tr key={r.id} className="border-t border-white/[0.04] align-top">
                  <td className="px-3 py-2 whitespace-nowrap text-white/55">
                    {new Date(r.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn("font-medium", a.tone)}>{a.label}</span>
                    {r.method && <span className="text-white/40"> · {r.method}</span>}
                    {extra && <p className="text-[12px] text-white/45">{extra}</p>}
                  </td>
                  <td className="px-3 py-2 text-white/70" title={r.userAgent ?? undefined}>
                    {r.browser || r.os ? (
                      <span className="flex items-center gap-1.5">
                        <DeviceIcon type={r.device?.type} />
                        {[r.browser && `${r.browser.name}${r.browser.version ? ` ${String(r.browser.version).split(".")[0]}` : ""}`, r.os && `${r.os.name}${r.os.version ? ` ${r.os.version}` : ""}`]
                          .filter(Boolean)
                          .join(" · ")}
                        {r.device?.model && <span className="text-white/40">· {[r.device.vendor, r.device.model].filter(Boolean).join(" ")}</span>}
                      </span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                    {r.contextFromCheckout && <p className="text-[11px] text-white/35">From the checkout session</p>}
                  </td>
                  <td className="px-3 py-2 text-white/70">
                    {r.ip ? <span className="font-mono text-[12px]">{r.ip}</span> : <span className="text-white/30">—</span>}
                    {place && <span className="text-white/50"> · {place}</span>}
                    {flags.length > 0 && <span className="ml-1 rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] text-amber-300">{flags.join(", ")}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-[13px] text-white/50">
          <span>
            {data.total.toLocaleString("en-US")} actions · page {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-white/10 p-1.5 disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-white/10 p-1.5 disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
