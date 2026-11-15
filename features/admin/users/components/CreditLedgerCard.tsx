"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type AdminLedgerRow,
  LEDGER_FILTER_TYPES,
  ledgerTypeStyle,
  modelName,
  signedCredits,
} from "@/features/credits/ledger";
import { LedgerThumb } from "@/features/credits/components/LedgerThumb";

const PAGE_SIZE = 25;

const ACTOR_LABEL: Record<AdminLedgerRow["actor"]["kind"], string> = {
  user: "User",
  admin: "Admin",
  system: "System",
  stripe: "Stripe",
};

const SOURCE_LABEL: Record<string, string> = {
  generation: "Generation",
  "video-clipping": "Clipping",
  "video-analyzer": "Video analyzer",
  subscription: "Subscription",
  "credit-pack": "Credit pack",
  admin: "Admin",
  support: "Support",
  signup: "Sign-up",
  referral: "Referral",
  system: "System",
  legacy: "Before links",
};

async function fetchLedger(userId: string, type: string, offset: number) {
  const params = new URLSearchParams({ offset: String(offset), limit: String(PAGE_SIZE) });
  if (type) params.set("type", type);
  const res = await fetch(`/api/admin/users/${userId}/credit-transactions?${params}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Couldn't load the credit history");
  return json as { total: number; data: AdminLedgerRow[] };
}

function CopyId({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(value).then(
          () => toast.success(`${label} id copied`),
          () => toast.error("Couldn't copy"),
        );
      }}
      title={`${label} ${value}`}
      className="inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/50 hover:border-white/20 hover:text-white"
    >
      {label} {value.slice(-6)}
      <Copy className="size-3" />
    </button>
  );
}

/**
 * The user's credit ledger: every change to the balance, newest first, with what it
 * paid for (job, generation, output), the payment behind it, and who made it.
 */
export function CreditLedgerCard({ userId }: { userId: string }) {
  const [type, setType] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin", "credit-ledger", userId, type, offset],
    queryFn: () => fetchLedger(userId, type, offset),
    placeholderData: keepPreviousData,
  });

  const total = data?.total ?? 0;
  const rows = data?.data ?? [];
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Credit history</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Every change to the balance, with what it paid for.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && <Loader2 className="size-4 animate-spin text-white/40" />}
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setOffset(0);
            }}
            aria-label="Filter by type"
            className="rounded-lg border border-white/10 bg-neutral-900 px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="">All types</option>
            {LEDGER_FILTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {ledgerTypeStyle(t).label}
                {t === "FRAUD" ? " (fraud)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "oklch(0.13 0 0)" }}
      >
        {isError ? (
          <p className="px-6 py-10 text-center text-sm text-red-400">Couldn&apos;t load the credit history.</p>
        ) : isLoading ? (
          <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-white/40">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </div>
        ) : !rows.length ? (
          <p className="px-6 py-10 text-center text-sm text-white/35">No credit changes{type ? " of this type" : ""}.</p>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {rows.map((t) => {
              const style = ledgerTypeStyle(t.type);
              const who = t.actorEmail ?? ACTOR_LABEL[t.actor.kind] ?? t.actor.kind;
              return (
                <div key={t.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <LedgerThumb media={t.media} count={t.mediaCount} />
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold", style.className)}>
                          {style.label}
                        </span>
                        {t.model && <span className="truncate text-xs font-medium text-white/80">{modelName(t.model)}</span>}
                        <span className="text-[11px] text-white/35">
                          {SOURCE_LABEL[t.source ?? ""] ?? t.source} · by {who}
                        </span>
                      </div>
                      {t.note && (
                        <p className="truncate text-xs text-white/55" title={t.note}>
                          {t.note}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-white/35">
                          {new Date(t.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                        {t.jobId && <CopyId label="Job" value={t.jobId} />}
                        {t.generationId && <CopyId label="Gen" value={t.generationId} />}
                        {t.reversalOf && <CopyId label="Refunds" value={t.reversalOf} />}
                        {t.subject && <CopyId label={t.subject.model.replace(/SchemaClass$/, "")} value={t.subject.id} />}
                        {t.invoice?.url ? (
                          <a
                            href={t.invoice.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-white/60 hover:border-white/20 hover:text-white"
                          >
                            Invoice {(t.invoice.amount / 100).toLocaleString("en-US", { style: "currency", currency: t.invoice.currency.toUpperCase() })}
                            <ExternalLink className="size-3" />
                          </a>
                        ) : t.billingTransactionId ? (
                          <CopyId label="Payment" value={t.billingTransactionId} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 pl-[52px] sm:pl-0">
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        t.amount < 0 ? "text-red-300" : t.amount === 0 ? "text-white/50" : "text-emerald-300",
                      )}
                    >
                      {signedCredits(t.amount)}
                    </span>
                    <span className="w-32 text-right text-xs tabular-nums text-white/40">
                      Balance {t.balanceAfter.toLocaleString()}
                      {t.packBalanceAfter ? (
                        <span className="block text-[10px] text-white/30">pack {t.packBalanceAfter.toLocaleString()}</span>
                      ) : null}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-white/[0.05] px-4 py-2.5 text-xs text-white/45">
            <span>
              {total.toLocaleString()} changes · page {page} of {pages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                disabled={offset === 0}
                aria-label="Newer"
                className="rounded-md p-1.5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total}
                aria-label="Older"
                className="rounded-md p-1.5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
