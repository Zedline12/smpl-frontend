"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  Coins,
  DollarSign,
  Loader2,
  Percent,
  Receipt,
  RefreshCw,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_MODELS, VIDEO_MODELS, AUDIO_MODELS, STUDIO_MODELS } from "@/features/generation/enums/models.enum";
import { offeringName, useCatalog } from "@/features/catalog/catalog";

// ─── types ─────────────────────────────────────────────────────────────────────

type Unit = "second" | "item";
type Params = Record<string, unknown>;
/** Our models that run on another one (Gensu → Kling 4.0) cost what that call costs. */
type CostFrom = { model: string; note: string } | null;
/** What it is: a third-party model, our white-label generator, or our compute. */
type Kind = "model" | "generator" | "compute";

interface PlanRate {
  id: string;
  name: string;
  billingPeriod: string;
  perCredit: number;
  feePerCredit: number;
}

interface ModelItem {
  model: string;
  name: string;
  kind: Kind | null;
  internal: boolean;
  extraCostPerUnit: number;
  unit: Unit;
  costFrom: CostFrom;
  note: string;
  minMarginPct: number;
  maxMarginPct: number | null;
  missingCosts: number;
  missingPrices: number;
  setUp: boolean;
  lowestMarginPct: number | null;
  highestMarginPct: number | null;
  belowMin: boolean;
  aboveMax: boolean;
}

interface PlanMoney {
  planId: string;
  userPaysUsd: number;
  costUsd: number;
  feeUsd: number;
  grossProfitUsd: number;
  grossMarginPct: number | null;
  netProfitUsd: number;
  netMarginPct: number | null;
  belowMin: boolean;
  aboveMax: boolean;
}

interface Summary {
  typicalUnits: number;
  rates: number;
  priced: number;
  missingCosts: number;
  missingPrices: number;
  avgCostUsd: number | null;
  avgCredits: number | null;
}

interface RateRow {
  parameters: Params;
  ruleId: string | null;
  /** Its own rate, or (Smpl generators) what the model it runs on costs per unit. */
  pricePerUnit: number | null;
  /** pricePerUnit + the extra cost: what the money below uses. */
  totalPerUnit: number | null;
  creditsPerUnit: number | null;
  example: { units: number; costUsd: number; credits: number } | null;
}

interface Overview {
  model: string;
  name: string;
  kind: Kind | null;
  internal: boolean;
  extraCostPerUnit: number;
  unit: Unit;
  costFrom: CostFrom;
  note: string;
  minMarginPct: number;
  maxMarginPct: number | null;
  priceVersion: number;
  plans: PlanRate[];
  rows: RateRow[];
  byPlan: PlanMoney[];
  summary: Summary;
}

interface Preview {
  minMarginPct: number;
  maxMarginPct: number | null;
  current: { summary: Summary; byPlan: PlanMoney[] };
  rows: RateRow[];
  byPlan: PlanMoney[];
  summary: Summary;
}

// ─── helpers ───────────────────────────────────────────────────────────────────

const GROUPS = [
  { label: "Image", models: IMAGE_MODELS },
  { label: "Video", models: VIDEO_MODELS },
  { label: "Audio", models: AUDIO_MODELS },
  { label: "Studio", models: STUDIO_MODELS },
];
const ALL_MODELS = GROUPS.flatMap((g) => g.models);
const EXTRA_NAMES: Record<string, string> = {
  "video-clipping": "Clipping Studio",
  "video-analyzer": "Video Analyzer",
};
const modelDef = (id: string) => ALL_MODELS.find((m) => m.id === id);
/** The catalog name (admin-editable), else the bundled one. */
const modelName = (id: string) => offeringName(id, modelDef(id)?.name ?? EXTRA_NAMES[id] ?? id);

/** The picker's categories: what each model is. */
const KIND_GROUPS: { kind: Kind; label: string }[] = [
  { kind: "generator", label: "Smpl generators" },
  { kind: "model", label: "Models" },
  { kind: "compute", label: "Smpl compute" },
];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/credit-pricing${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return (json?.data ?? json) as T;
}

const usd = (n: number | null | undefined) => {
  if (n == null) return "—";
  if (n === 0) return "$0";
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a < 0.01) return `${sign}$${a.toFixed(4)}`;
  if (a < 1) return `${sign}$${a.toFixed(3)}`;
  return `${sign}$${a.toFixed(2)}`;
};
const num = (n: number | null | undefined, digits = 1) =>
  n == null ? "—" : Number.isInteger(n) ? String(n) : n.toFixed(digits);
const pct = (n: number | null | undefined) => (n == null ? "—" : `${num(n)}%`);

const humanKey = (k: string) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase()
    .replace(/^generate /, "");
/** {resolution: "720p", generateAudio: true} -> "720p · audio" */
const paramLabel = (p: Params) =>
  Object.entries(p)
    .map(([k, v]) => (typeof v === "boolean" ? (v ? humanKey(k) : `no ${humanKey(k)}`) : String(v)))
    .join(" · ") || "Any input";

const planLabel = (p: PlanRate) => p.name.replace(/ plan$/i, "");
const periodLabel = (p: PlanRate) => (p.billingPeriod === "YEARLY" ? "Yearly" : "Monthly");
const perUseLabel = (unit: Unit, units: number) => (unit === "second" ? `${units}s` : units === 1 ? "1 use" : `${units} uses`);

/** Only profit carries a color: red when we lose money, green otherwise. */
const profitTone = (m: number | null | undefined) =>
  m == null ? "text-white/40" : m < 0 ? "text-red-400" : "text-emerald-400";

const card = "rounded-2xl border border-white/[0.08] bg-[#161616]";

// ─── page ──────────────────────────────────────────────────────────────────────

/**
 * Admin pricing. Pick a model: see what it costs us and what every plan earns on it
 * (gross = revenue − provider cost, net = after Stripe fees). Set a minimum and maximum
 * margin, watch every plan's numbers change, then save the new credit prices — or not.
 */
export function PricingStudio() {
  // Names follow the catalog (admin renames).
  useCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const list = useQuery({
    queryKey: ["admin", "pricing", "models"],
    queryFn: () => api<{ priceVersion: number; plans: PlanRate[]; models: ModelItem[] }>("/models"),
  });
  const models = list.data?.models ?? [];
  const selected = searchParams.get("model") ?? models.find((m) => m.belowMin || !m.setUp)?.model ?? models[0]?.model ?? null;
  const select = (model: string) => router.replace(`${pathname}?model=${encodeURIComponent(model)}`, { scroll: false });

  const overview = useQuery({
    queryKey: ["admin", "pricing", "model", selected],
    queryFn: () => api<Overview>(`/models/${encodeURIComponent(selected!)}`),
    enabled: !!selected,
  });

  if (list.isError) return <p className="text-[13px] text-red-400">{(list.error as Error).message}</p>;
  const o = overview.data && overview.data.model === selected ? overview.data : null;

  return (
    <div className="space-y-10">
      {o ? (
        <>
          <ModelHeader
            overview={o}
            picker={<ModelSelect list={list.data?.models ?? null} selected={selected} onSelect={select} />}
          />
          <AlertsBar models={models} onOpen={select} />
          <Section title="Overview" description={`On an average ${perUseLabel(o.unit, o.summary.typicalUnits)} across every option.`}>
            <KpiGrid overview={o} />
          </Section>
          <Section title="Profit by plan" description="What each plan earns on this model today. Net is after Stripe's fees.">
            <PlanCards plans={o.plans} byPlan={o.byPlan} minMarginPct={o.minMarginPct} maxMarginPct={o.maxMarginPct} />
          </Section>
          <Section
            title="Edit pricing"
            description="Set the margin range. The cheapest plan earns the minimum; plans above the maximum are flagged. Nothing changes until you save."
          >
            <MarginEditor key={`${o.model}:${o.priceVersion}:${o.minMarginPct}:${o.maxMarginPct}`} overview={o} />
          </Section>
          <Section
            title="Provider costs"
            description={
              o.costFrom
                ? `Pulled from ${modelName(o.costFrom.model)}, the model it runs on: ${o.costFrom.note}.`
                : `What each option costs us, ${o.note}. Saving a cost doesn't change credit prices until you save pricing.`
            }
          >
            <CostTable overview={o} onOpen={select} />
          </Section>
          <RepriceAll />
        </>
      ) : (
        <div className={cn(card, "flex h-48 items-center justify-center gap-2 text-sm text-white/40")}>
          <Loader2 className="size-4 animate-spin" /> Loading{selected ? ` ${modelName(selected)}` : ""}…
        </div>
      )}
    </div>
  );
}

// ─── model select ──────────────────────────────────────────────────────────────

const rangeText = (m: ModelItem) =>
  m.lowestMarginPct == null ? null : m.highestMarginPct == null ? pct(m.lowestMarginPct) : `${num(m.lowestMarginPct, 0)}–${pct(m.highestMarginPct)}`;

/** Button + menu: categories on the left, that category's models on the right. */
function ModelSelect({
  list,
  selected,
  onSelect,
}: {
  list: ModelItem[] | null;
  selected: string | null;
  onSelect: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    if (!list) return [];
    const out = KIND_GROUPS.map((g) => ({
      label: g.label,
      items: list.filter((i) => !i.internal && i.kind === g.kind),
    }));
    // Models we only use ourselves (not sold directly).
    out.push({ label: "Internal", items: list.filter((i) => i.internal || !i.kind) });
    return out.filter((g) => g.items.length);
  }, [list]);

  const selectedGroup = groups.find((g) => g.items.some((i) => i.model === selected))?.label;
  const [category, setCategory] = useState<string | null>(null);
  const activeCategory = category ?? selectedGroup ?? groups[0]?.label;
  const items = groups.find((g) => g.label === activeCategory)?.items ?? [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={!list}
        onClick={() => {
          setCategory(null);
          setOpen((v) => !v);
        }}
        aria-label="Change model"
        title="Change model"
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-colors disabled:opacity-50",
          open ? "bg-white/[0.1] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white",
        )}
      >
        <ChevronDown className={cn("size-6 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 flex w-[min(600px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#161616] shadow-2xl shadow-black/50">
          <div className="w-36 shrink-0 space-y-0.5 border-r border-white/[0.06] p-2">
            {groups.map((g) => (
              <button
                key={g.label}
                type="button"
                onMouseEnter={() => setCategory(g.label)}
                onClick={() => setCategory(g.label)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors",
                  g.label === activeCategory ? "bg-white/[0.07] font-semibold text-white" : "text-white/55 hover:text-white",
                )}
              >
                {g.label}
                <span className="text-[11px] font-normal text-white/30">{g.items.length}</span>
              </button>
            ))}
          </div>
          <div className="max-h-[420px] flex-1 overflow-y-auto p-2">
            {items.map((item) => {
              const active = item.model === selected;
              return (
                <button
                  key={item.model}
                  type="button"
                  onClick={() => {
                    onSelect(item.model);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                  )}
                >
                  <span className="flex size-6 shrink-0 items-center justify-center [&>svg]:size-5">{modelDef(item.model)?.svg}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-white">{modelName(item.model)}</span>
                  {!item.setUp ? (
                    <span className="text-[11px] font-semibold text-red-300">Not priced</span>
                  ) : (
                    <span
                      className={cn(
                        "text-[12px] font-semibold tabular-nums",
                        item.belowMin ? "text-red-400" : item.aboveMax ? "text-amber-300" : "text-emerald-400",
                      )}
                    >
                      {rangeText(item)}
                    </span>
                  )}
                  {active && <Check className="size-4 shrink-0 text-white/60" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── header, alerts, KPIs ──────────────────────────────────────────────────────

function ModelHeader({ overview, picker }: { overview: Overview; picker: React.ReactNode }) {
  const def = modelDef(overview.model);
  const s = overview.summary;
  return (
    <header className="flex items-center justify-between gap-6 border-b border-white/[0.06] pb-8">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] [&>svg]:size-9">
          {def?.svg ?? <Coins className="size-8 text-white/60" />}
        </div>
        <div className="min-w-0">
          <h1
            className="truncate text-[36px] leading-none tracking-tight text-white md:text-[48px]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {modelName(overview.model)}
          </h1>
          <p className="mt-3 text-[13px] text-white/45">
            Priced <span className="font-semibold text-white/75">per {overview.unit}</span>
            {" · "}
            <span className="font-semibold text-white/75">{s.rates}</span> option{s.rates === 1 ? "" : "s"}
            {" · margin "}
            <span className="font-semibold text-white/75">
              {pct(overview.minMarginPct)}
              {overview.maxMarginPct != null ? ` – ${pct(overview.maxMarginPct)}` : "+"}
            </span>
          </p>
        </div>
      </div>
      {picker}
    </header>
  );
}

function AlertsBar({ models, onOpen }: { models: ModelItem[]; onOpen: (m: string) => void }) {
  const below = models.filter((m) => m.belowMin);
  const unpriced = models.filter((m) => !m.setUp);
  if (!below.length && !unpriced.length) return null;
  const chip = "rounded-lg px-2 py-1 text-[12px] font-medium transition-colors";
  return (
    <div className={cn(card, "flex flex-col gap-3 p-4")}>
      {below.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-red-300">
            <AlertTriangle className="size-4" /> Below minimum margin:
          </span>
          {below.map((m) => (
            <button key={m.model} type="button" onClick={() => onOpen(m.model)} className={cn(chip, "bg-red-500/10 text-red-200 hover:bg-red-500/20")}>
              {modelName(m.model)}
            </button>
          ))}
        </div>
      )}
      {unpriced.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-300">
            <AlertTriangle className="size-4" /> Not priced (can&apos;t be generated):
          </span>
          {unpriced.map((m) => (
            <button key={m.model} type="button" onClick={() => onOpen(m.model)} className={cn(chip, "bg-amber-500/10 text-amber-100 hover:bg-amber-500/20")}>
              {modelName(m.model)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-bold text-white">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-white/40">{description}</p>}
      </div>
      {children}
    </section>
  );
}

type Accent = "orange" | "blue" | "violet" | "emerald" | "red" | "cyan";
// Full class names so Tailwind keeps them.
const ACCENTS: Record<Accent, { card: string; icon: string }> = {
  orange: { card: "bg-orange-500/[0.06] border-orange-500/15", icon: "bg-orange-500/15 text-orange-400" },
  blue: { card: "bg-sky-500/[0.06] border-sky-500/15", icon: "bg-sky-500/15 text-sky-400" },
  violet: { card: "bg-violet-500/[0.07] border-violet-500/15", icon: "bg-violet-500/15 text-violet-400" },
  emerald: { card: "bg-emerald-500/[0.06] border-emerald-500/15", icon: "bg-emerald-500/15 text-emerald-400" },
  red: { card: "bg-red-500/[0.06] border-red-500/15", icon: "bg-red-500/15 text-red-400" },
  cyan: { card: "bg-cyan-500/[0.06] border-cyan-500/15", icon: "bg-cyan-500/15 text-cyan-400" },
};

function Kpi({
  label,
  value,
  tone,
  accent,
  icon: Icon,
  children,
}: {
  label: string;
  value: string;
  tone?: string;
  accent: Accent;
  icon: LucideIcon;
  children?: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-2xl border p-5", a.card)}>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-white/55">{label}</p>
        <p className={cn("mt-2.5 truncate text-[30px] leading-none font-bold tabular-nums", tone ?? "text-white")}>{value}</p>
        {children && <p className="mt-3 text-[12px] leading-snug text-white/40">{children}</p>}
      </div>
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", a.icon)}>
        <Icon className="size-5" />
      </div>
    </div>
  );
}

const B = ({ children }: { children: React.ReactNode }) => <span className="font-semibold text-white/70 tabular-nums">{children}</span>;

function KpiGrid({ overview }: { overview: Overview }) {
  const s = overview.summary;
  const first = overview.byPlan[0];
  const last = overview.byPlan[overview.byPlan.length - 1];
  const losing = (first?.netProfitUsd ?? 0) < 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Costs us" value={usd(s.avgCostUsd)} accent="orange" icon={Receipt}>
          Provider cost per {perUseLabel(overview.unit, s.typicalUnits)}
        </Kpi>
        <Kpi label="Credits" value={s.avgCredits != null ? `${num(s.avgCredits)} cr` : "—"} accent="violet" icon={Coins}>
          What users are charged
        </Kpi>
        <Kpi label="User pays" value={first ? usd(first.userPaysUsd) : "—"} accent="blue" icon={DollarSign}>
          {first && last ? (
            <>
              <B>{usd(first.userPaysUsd)}</B> – <B>{usd(last.userPaysUsd)}</B> by plan
            </>
          ) : (
            "No credit price yet"
          )}
        </Kpi>
        <Kpi
          label="Net profit"
          value={first ? usd(first.netProfitUsd) : "—"}
          tone={profitTone(first?.netProfitUsd)}
          accent={losing ? "red" : "emerald"}
          icon={TrendingUp}
        >
          {first && last ? (
            <>
              Up to <B>{usd(last.netProfitUsd)}</B> on the priciest plan
            </>
          ) : (
            "Needs a cost and a credit price"
          )}
        </Kpi>
        <Kpi
          label="Net margin"
          value={first ? pct(first.netMarginPct) : "—"}
          tone={profitTone(first?.netMarginPct)}
          accent={losing ? "red" : "cyan"}
          icon={Percent}
        >
          {first && last ? (
            <>
              <B>{pct(first.netMarginPct)}</B> – <B>{pct(last.netMarginPct)}</B> across plans
            </>
          ) : (
            "Needs a cost and a credit price"
          )}
        </Kpi>
      </div>
      {(s.missingCosts > 0 || s.missingPrices > 0) && (
        <p className="flex items-start gap-2 text-[12px] text-white/50">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
          <span>
            {s.missingCosts > 0 && (
              <>
                <B>{s.missingCosts}</B> of {s.rates} options have no provider cost.{" "}
              </>
            )}
            {s.missingPrices > 0 && (
              <>
                <B>{s.missingPrices}</B> have no credit price (save pricing to set them).{" "}
              </>
            )}
            Averages only count options that have both.
          </span>
        </p>
      )}
    </div>
  );
}

// ─── profit by plan ────────────────────────────────────────────────────────────

function PlanCards({
  plans,
  byPlan,
  minMarginPct,
  maxMarginPct,
}: {
  plans: PlanRate[];
  byPlan: PlanMoney[];
  minMarginPct: number;
  maxMarginPct: number | null;
}) {
  if (!byPlan.length)
    return <div className={cn(card, "p-6 text-[13px] text-white/45")}>Needs a provider cost and a credit price.</div>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {plans.map((p) => {
        const m = byPlan.find((b) => b.planId === p.id);
        if (!m) return null;
        return (
          <div
            key={p.id}
            className={cn(
              card,
              "space-y-4 p-5",
              m.belowMin && "border-red-500/30",
              m.aboveMax && "border-amber-500/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold text-white">{planLabel(p)}</p>
                <p className="text-[12px] text-white/40">
                  {periodLabel(p)} · {usd(p.perCredit)} / credit
                </p>
              </div>
              {m.belowMin ? (
                <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[11px] font-semibold text-red-300">Below {pct(minMarginPct)}</span>
              ) : m.aboveMax ? (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">Above {pct(maxMarginPct)}</span>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[11px] font-medium text-white/45">Gross profit</p>
                <p className={cn("mt-1 text-[20px] font-bold tabular-nums", profitTone(m.grossProfitUsd))}>{usd(m.grossProfitUsd)}</p>
                <p className="text-[11px] text-white/40 tabular-nums">{pct(m.grossMarginPct)} margin</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[11px] font-medium text-white/45">Net profit</p>
                <p className={cn("mt-1 text-[20px] font-bold tabular-nums", profitTone(m.netProfitUsd))}>{usd(m.netProfitUsd)}</p>
                <p className="text-[11px] text-white/40 tabular-nums">{pct(m.netMarginPct)} margin</p>
              </div>
            </div>
            <p className="text-[12px] text-white/40">
              User pays <B>{usd(m.userPaysUsd)}</B> · cost <B>{usd(m.costUsd)}</B> · Stripe <B>{usd(m.feeUsd)}</B>
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── margin editor ─────────────────────────────────────────────────────────────

function MarginEditor({ overview }: { overview: Overview }) {
  const queryClient = useQueryClient();
  const [min, setMin] = useState(String(overview.minMarginPct));
  const [max, setMax] = useState(overview.maxMarginPct == null ? "" : String(overview.maxMarginPct));

  // Debounced so typing doesn't fire a request per keystroke.
  const [debounced, setDebounced] = useState({ min, max });
  useEffect(() => {
    const t = setTimeout(() => setDebounced({ min, max }), 300);
    return () => clearTimeout(t);
  }, [min, max]);

  const minN = Number(debounced.min);
  const maxN = debounced.max.trim() === "" ? null : Number(debounced.max);
  const invalid =
    debounced.min.trim() === "" ||
    !Number.isFinite(minN) ||
    minN < 0 ||
    minN >= 100 ||
    (maxN !== null && (!Number.isFinite(maxN) || maxN >= 100 || maxN < minN));
  const changed = minN !== overview.minMarginPct || maxN !== overview.maxMarginPct;

  const preview = useQuery({
    queryKey: ["admin", "pricing", "preview", overview.model, overview.priceVersion, minN, maxN],
    queryFn: () =>
      api<Preview>(`/models/${encodeURIComponent(overview.model)}/preview`, {
        method: "POST",
        body: JSON.stringify({ minMarginPct: minN, maxMarginPct: maxN }),
      }),
    enabled: !invalid,
    placeholderData: (prev) => prev,
  });

  const save = useMutation({
    mutationFn: () =>
      api<{ version: number }>(`/models/${encodeURIComponent(overview.model)}/pricing`, {
        method: "POST",
        body: JSON.stringify({ minMarginPct: minN, maxMarginPct: maxN }),
      }),
    onSuccess: (r) => {
      toast.success(`${modelName(overview.model)} repriced (price list v${r.version})`);
      void queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const p = preview.data;
  const pricesChange = !!p && p.rows.some((r, i) => r.creditsPerUnit !== overview.rows[i]?.creditsPerUnit);
  const input =
    "h-12 w-32 rounded-xl border border-white/10 bg-neutral-900 px-4 text-[18px] font-semibold text-white tabular-nums focus:border-white/30 focus:outline-none";

  return (
    <div className={cn(card, "space-y-5 p-5")}>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-white/55">Minimum margin</span>
          <div className="flex items-center gap-2">
            <input type="number" min={0} max={99} step={0.5} value={min} onChange={(e) => setMin(e.target.value)} className={input} />
            <span className="text-white/50">%</span>
          </div>
          <span className="text-[11px] text-white/35">The cheapest plan earns this</span>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-white/55">Maximum margin</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={99}
              step={0.5}
              value={max}
              placeholder="None"
              onChange={(e) => setMax(e.target.value)}
              className={input}
            />
            <span className="text-white/50">%</span>
          </div>
          <span className="text-[11px] text-white/35">Plans above it are flagged</span>
        </label>
        <div className="ml-auto flex items-center gap-2">
          {preview.isFetching && <Loader2 className="size-4 animate-spin text-white/40" />}
          <button
            type="button"
            disabled={!changed && !pricesChange}
            onClick={() => {
              setMin(String(overview.minMarginPct));
              setMax(overview.maxMarginPct == null ? "" : String(overview.maxMarginPct));
            }}
            className="h-11 rounded-xl border border-white/15 px-4 text-[13px] font-medium text-white/80 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="button"
            disabled={invalid || !p || (!changed && !pricesChange) || save.isPending}
            onClick={() => save.mutate()}
            className="h-11 rounded-xl bg-white px-5 text-[13px] font-semibold text-black hover:bg-white/90 disabled:opacity-40"
          >
            {save.isPending ? "Saving…" : "Save pricing"}
          </button>
        </div>
      </div>

      {invalid ? (
        <p className="text-[13px] text-amber-300">Enter a minimum from 0 to 99%, and a maximum at least that high (or leave it empty).</p>
      ) : preview.isError ? (
        <p className="text-[13px] text-red-400">{(preview.error as Error).message}</p>
      ) : !p ? (
        <div className="flex items-center gap-2 text-[13px] text-white/40">
          <Loader2 className="size-4 animate-spin" /> Working out every plan…
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[13px] text-white/55">
            <span>
              Credits per {perUseLabel(overview.unit, p.summary.typicalUnits)}:{" "}
              <B>{num(p.current.summary.avgCredits)}</B> →{" "}
              <span className="font-semibold text-white tabular-nums">{num(p.summary.avgCredits)}</span>
            </span>
            <span>
              Cost: <B>{usd(p.summary.avgCostUsd)}</B>
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
            <table className="w-full min-w-[760px] text-[13px]">
              <thead>
                <tr className="text-left text-[11px] tracking-wide text-white/40 uppercase">
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                  <th className="px-4 py-2.5 text-right font-medium">User pays</th>
                  <th className="px-4 py-2.5 text-right font-medium">Gross profit</th>
                  <th className="px-4 py-2.5 text-right font-medium">Gross margin</th>
                  <th className="px-4 py-2.5 text-right font-medium">Net profit</th>
                  <th className="px-4 py-2.5 text-right font-medium">Net margin</th>
                  <th className="px-4 py-2.5 text-right font-medium">Now</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {overview.plans.map((plan) => {
                  const m = p.byPlan.find((b) => b.planId === plan.id);
                  const now = p.current.byPlan.find((b) => b.planId === plan.id);
                  if (!m) return null;
                  return (
                    <tr key={plan.id} className={cn(m.belowMin && "bg-red-500/[0.06]", m.aboveMax && "bg-amber-500/[0.06]")}>
                      <td className="px-4 py-3">
                        <span className="font-medium text-white">{planLabel(plan)}</span>
                        <span className="ml-2 text-white/40">{periodLabel(plan)}</span>
                        {m.belowMin && <span className="ml-2 text-[11px] font-semibold text-red-300">below min</span>}
                        {m.aboveMax && <span className="ml-2 text-[11px] font-semibold text-amber-300">above max</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-white/70 tabular-nums">{usd(m.userPaysUsd)}</td>
                      <td className={cn("px-4 py-3 text-right tabular-nums", profitTone(m.grossProfitUsd))}>{usd(m.grossProfitUsd)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-white tabular-nums">{pct(m.grossMarginPct)}</td>
                      <td className={cn("px-4 py-3 text-right tabular-nums", profitTone(m.netProfitUsd))}>{usd(m.netProfitUsd)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-white tabular-nums">{pct(m.netMarginPct)}</td>
                      <td className="px-4 py-3 text-right text-white/40 tabular-nums">{now ? pct(now.grossMarginPct) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-white/35">
            Money per average {perUseLabel(overview.unit, p.summary.typicalUnits)}. &quot;Now&quot; is today&apos;s gross margin on that plan.
          </p>
        </>
      )}
    </div>
  );
}

// ─── provider costs ────────────────────────────────────────────────────────────

function CostTable({ overview, onOpen }: { overview: Overview; onOpen: (model: string) => void }) {
  const from = overview.costFrom;
  return (
    <div className={cn(card, "overflow-x-auto")}>
      {overview.kind === "generator" && <ExtraCost overview={overview} />}
      {from && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <p className="text-[13px] text-white/60">
            Costs per {overview.unit} of {modelName(overview.model)}, derived from {modelName(from.model)}&apos;s. They update when its costs
            change.
          </p>
          <button
            type="button"
            onClick={() => onOpen(from.model)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white/80 hover:bg-white/[0.06]"
          >
            Open {modelName(from.model)}
            <ArrowUpRight className="size-3.5" />
          </button>
        </div>
      )}
      <table className="w-full min-w-[560px] text-[13px]">
        <thead>
          <tr className="text-left text-[11px] tracking-wide text-white/40 uppercase">
            <th className="px-4 py-2.5 font-medium">Option</th>
            <th className="px-4 py-2.5 font-medium">Cost / {overview.unit}</th>
            <th className="px-4 py-2.5 text-right font-medium">Credits / {overview.unit}</th>
            <th className="px-4 py-2.5 text-right font-medium">{perUseLabel(overview.unit, overview.summary.typicalUnits)}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05]">
          {overview.rows.map((r) => (
            <CostRow
              key={JSON.stringify(r.parameters)}
              model={overview.model}
              row={r}
              readOnly={!!from}
              extra={overview.extraCostPerUnit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A Smpl generator's extra cost per unit (our compute, storage…) on top of what it runs on. */
function ExtraCost({ overview }: { overview: Overview }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState<string | null>(null);
  const current = overview.extraCostPerUnit;
  const shown = value ?? (current > 0 ? String(current) : "");
  const save = useMutation({
    mutationFn: (pricePerUnit: number | null) =>
      api<Overview>(`/models/${encodeURIComponent(overview.model)}/extra-cost`, {
        method: "PUT",
        body: JSON.stringify({ pricePerUnit }),
      }),
    onSuccess: () => {
      toast.success("Extra cost saved. Save pricing to update credit prices.");
      setValue(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const next = shown.trim() === "" ? 0 : Number(shown);
  const dirty = value !== null && Number.isFinite(next) && next >= 0 && next !== current;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-white/80">Extra cost per {overview.unit}</p>
        <p className="text-[12px] text-white/45">Our own costs on top (compute, storage). Added to every option below.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white/40">$</span>
        <input
          type="number"
          min={0}
          step="any"
          value={shown}
          placeholder="0"
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-28 rounded-lg border border-white/10 bg-neutral-900 px-3 text-white tabular-nums focus:outline-none"
        />
        {dirty && (
          <button
            type="button"
            onClick={() => save.mutate(next > 0 ? next : null)}
            disabled={save.isPending}
            aria-label="Save extra cost"
            className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/15"
          >
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function CostRow({ model, row, readOnly, extra }: { model: string; row: RateRow; readOnly: boolean; extra: number }) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState<string | null>(null);
  const value = price ?? (row.pricePerUnit === null ? "" : String(row.pricePerUnit));
  const save = useMutation({
    mutationFn: async (next: number) => {
      const init = (method: string, body: object) => ({
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const res = row.ruleId
        ? await fetch(`/api/model-costs/${row.ruleId}`, init("PATCH", { price: next }))
        : await fetch("/api/model-costs", init("POST", { model, parameters: row.parameters, price: next }));
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Couldn't save the cost");
    },
    onSuccess: () => {
      toast.success("Cost saved");
      setPrice(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const dirty = price !== null && price !== "" && Number(price) !== row.pricePerUnit;

  return (
    <tr>
      <td className="px-4 py-2.5 text-white/80">{paramLabel(row.parameters)}</td>
      <td className="px-4 py-2">
        {readOnly ? (
          <span className={cn("tabular-nums", row.pricePerUnit === null ? "text-red-300" : "text-white/70")}>
            {row.pricePerUnit === null ? "Missing upstream cost" : `${Number(row.pricePerUnit.toFixed(6))}`}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-white/40">$</span>
            <input
              type="number"
              min={0}
              step="any"
              value={value}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Missing"
              className={cn(
                "h-9 w-28 rounded-lg border bg-neutral-900 px-3 text-white tabular-nums focus:outline-none",
                row.pricePerUnit === null ? "border-red-500/40" : "border-white/10",
              )}
            />
            {dirty && (
              <button
                type="button"
                onClick={() => save.mutate(Number(price))}
                disabled={save.isPending}
                aria-label="Save cost"
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/15"
              >
                {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              </button>
            )}
          </div>
        )}
        {extra > 0 && row.pricePerUnit !== null && (
          <p className="mt-0.5 text-[11px] text-white/40 tabular-nums">+ ${Number(extra.toFixed(6))} extra</p>
        )}
      </td>
      <td className="px-4 py-2.5 text-right tabular-nums">
        {row.creditsPerUnit === null ? <span className="text-red-300">No price</span> : <span className="text-white">{row.creditsPerUnit}</span>}
      </td>
      <td className="px-4 py-2.5 text-right text-white/60 tabular-nums">
        {row.example ? `${usd(row.example.costUsd)} → ${row.example.credits} cr` : "—"}
      </td>
    </tr>
  );
}

// ─── reprice everything ────────────────────────────────────────────────────────

interface RepriceAllResult {
  version?: number;
  changes: { model: string; parameters: Params; from: number | null; to: number }[];
  skipped: { model: string; reason: string }[];
}

/** After a plan or cost change: every model back to its saved minimum margin, after a review. */
function RepriceAll() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const preview = useQuery({
    queryKey: ["admin", "pricing", "reprice-all"],
    queryFn: () => api<RepriceAllResult>("/reprice", { method: "POST", body: JSON.stringify({ dryRun: true }) }),
    enabled: open,
    staleTime: 0,
  });
  const apply = useMutation({
    mutationFn: () => api<RepriceAllResult>("/reprice", { method: "POST", body: JSON.stringify({}) }),
    onSuccess: (r) => {
      toast.success(`Every model repriced (price list v${r.version}, ${r.changes.length} prices changed)`);
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "pricing"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
  const changes = preview.data?.changes ?? [];

  return (
    <Section title="All models" description="After a plan or provider cost changes, bring every model back to its saved minimum margin.">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-[13px] font-medium text-white/80 hover:bg-white/[0.04]"
        >
          <RefreshCw className="size-4" /> Review repricing every model…
        </button>
      ) : (
        <div className={cn(card, "space-y-4 p-5")}>
          {preview.isLoading ? (
            <div className="flex items-center gap-2 text-[13px] text-white/40">
              <Loader2 className="size-4 animate-spin" /> Working out the changes…
            </div>
          ) : preview.isError ? (
            <p className="text-[13px] text-red-400">{(preview.error as Error).message}</p>
          ) : !changes.length ? (
            <p className="text-[13px] text-white/55">Every model is already at its minimum margin. Nothing would change.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-[13px]">
                <tbody className="divide-y divide-white/[0.05]">
                  {changes.map((c) => (
                    <tr key={c.model + JSON.stringify(c.parameters)}>
                      <td className="py-1.5 pr-3 text-white/80">{modelName(c.model)}</td>
                      <td className="py-1.5 pr-3 text-white/45">{paramLabel(c.parameters)}</td>
                      <td className="py-1.5 text-right text-white/60 tabular-nums">
                        {c.from ?? "—"} → <span className="font-semibold text-white">{c.to}</span> cr
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-xl border border-white/15 px-4 text-[13px] text-white/80">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => apply.mutate()}
              disabled={!changes.length || apply.isPending}
              className="h-10 rounded-xl bg-white px-4 text-[13px] font-semibold text-black disabled:opacity-40"
            >
              {apply.isPending ? "Repricing…" : `Apply ${changes.length} changes`}
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}
