"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Brain, CreditCard, LifeBuoy, ShieldAlert, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { int, pct, usd } from "@/features/admin/components/data-viz/format";
import { fetchOverview } from "../api";

const PROMPTS: { group: string; icon: LucideIcon; items: string[] }[] = [
  {
    group: "Growth",
    icon: Users,
    items: ["How many people signed up each day this month, by sign-in method?", "Which countries do our paying users come from?"],
  },
  {
    group: "Revenue",
    icon: TrendingUp,
    items: ["How did MRR move this month and why?", "What was our profit in the last 30 days, and which models cost the most?"],
  },
  {
    group: "Usage",
    icon: Activity,
    items: ["Top 10 users by credits used in the last 30 days", "Which models fail most this week, and why?"],
  },
  {
    group: "Reliability",
    icon: ShieldAlert,
    items: ["Are there stuck jobs or queue backlogs right now?", "What are the top open errors and where do they happen?"],
  },
  {
    group: "Support",
    icon: LifeBuoy,
    items: ["Which tickets are waiting on us? Draft replies for the urgent ones.", "How fast do we reply to support tickets this month?"],
  },
  {
    group: "Billing",
    icon: CreditCard,
    items: ["Are coupons bringing customers who stay?", "Who cancelled recently and what did they say?"],
  },
];

function Tile({ label, value, hint, tone, onClick }: { label: string; value: string; hint?: string; tone?: "bad" | "good"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
    >
      <p className="truncate text-[11.5px] font-medium text-white/45">{label}</p>
      <p className={cn("mt-1 truncate text-[19px] font-bold tabular-nums", tone === "bad" ? "text-red-300" : "text-white")}>{value}</p>
      {hint && <p className="mt-0.5 truncate text-[11px] text-white/35">{hint}</p>}
    </button>
  );
}

export function EmptyState({ onAsk }: { onAsk: (q: string) => void }) {
  const { data, isLoading, error } = useQuery({ queryKey: ["brain-overview"], queryFn: fetchOverview, staleTime: 60_000 });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 md:px-8">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}>
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-[26px] leading-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
            What do you want to know?
          </h1>
          <p className="text-[13px] text-white/45">Brain reads live data across growth, revenue, usage, reliability, support and security.</p>
        </div>
      </div>

      <section>
        <p className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-white/35">Right now</p>
        {isLoading && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[74px] animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        )}
        {error && <p className="text-[12.5px] text-white/40">The live numbers aren&apos;t available right now.</p>}
        {data && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Tile label="Users" value={int(data.users.total)} hint={`+${int(data.users.new7d)} this week`} onClick={() => onAsk("How are signups trending over the last 30 days?")} />
            <Tile label="MRR" value={usd(data.revenue.mrrCents)} hint={`${int(data.revenue.payingCustomers)} paying`} onClick={() => onAsk("How did MRR move this month and why?")} />
            <Tile
              label="Generations today"
              value={int(data.generations24h.total)}
              hint={`${pct(data.generations24h.failureRate)} failed`}
              tone={data.generations24h.failureRate >= 0.2 && data.generations24h.total >= 10 ? "bad" : undefined}
              onClick={() => onAsk("Which models are failing in the last 24 hours, and why?")}
            />
            <Tile label="Credits used today" value={int(data.creditsUsed24h)} onClick={() => onAsk("Who used the most credits in the last 24 hours?")} />
            <Tile label="Open tickets" value={int(data.openTickets)} onClick={() => onAsk("Which support tickets are waiting on us?")} />
            <Tile
              label="Open errors"
              value={int(data.openErrors)}
              hint={`${int(data.newErrors24h)} new today`}
              tone={data.newErrors24h > 0 ? "bad" : undefined}
              onClick={() => onAsk("What are the top open errors, where do they happen and how do I fix them?")}
            />
            <Tile
              label="Stuck jobs"
              value={data.stuckJobs == null ? "—" : int(data.stuckJobs)}
              tone={(data.stuckJobs ?? 0) > 0 ? "bad" : undefined}
              onClick={() => onAsk("Show me the stuck jobs right now")}
            />
            <Tile
              label="System"
              value={data.health ? "Healthy" : "Degraded"}
              hint={`${int(data.queueWaiting)} queued`}
              tone={data.health ? undefined : "bad"}
              onClick={() => onAsk("How healthy are the servers and queues right now?")}
            />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {PROMPTS.map(({ group, icon: Icon, items }) => (
          <div key={group} className="rounded-2xl border border-white/[0.07] bg-white/[0.015] p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-[12px] font-semibold text-white/55">
              <Icon className="h-3.5 w-3.5 text-[#b9a4ff]" /> {group}
            </p>
            <div className="space-y-1.5">
              {items.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onAsk(q)}
                  className="w-full rounded-lg px-2.5 py-2 text-left text-[12.5px] leading-snug text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
