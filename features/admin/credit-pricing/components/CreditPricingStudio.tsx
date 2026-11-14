"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  Coins,
  DollarSign,
  Loader2,
  Percent,
  Receipt,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  STUDIO_MODELS,
} from "@/features/generation/enums/models.enum";
import { ModelPricingTable, CreditPricingRule } from "./ModelPricingTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── types ─────────────────────────────────────────────────────────────────────

type Params = Record<string, unknown>;
interface CreditValue {
  perCredit: number;
  source: { kind: "plan" | "pack"; name: string } | null;
}
interface Derived {
  model: string;
  note: string;
}
interface Range {
  min: number;
  max: number;
}
interface Overview {
  model: string;
  unit: string;
  creditValue: CreditValue;
  derivedFrom: Derived | null;
  rows: {
    parameters: Params;
    credits: number | null;
    costUsd: number | null;
    userPaysUsd: number | null;
    markupPct: number | null;
  }[];
  summary: {
    combinations: number;
    priced: number;
    missingCost: number;
    missingCredits: number;
    avgCostUsd: number | null;
    avgCredits: number | null;
    avgUserPaysUsd: number | null;
    avgMarkupPct: number | null;
    costRange: Range | null;
    creditsRange: Range | null;
    markupRange: Range | null;
  };
}
interface Preview {
  markupPct: number;
  avgCredits: number | null;
  avgMarkupPct: number | null;
  skipped: Params[];
  rows: {
    parameters: Params;
    costUsd: number | null;
    credits: number | null;
    newCredits: number | null;
    newUserPaysUsd: number | null;
    newMarkupPct: number | null;
    skipped: boolean;
  }[];
}
interface ModelListItem {
  model: string;
  derivedFrom: Derived | null;
  avgMarkupPct: number | null;
}

// ─── helpers ───────────────────────────────────────────────────────────────────

const GROUPS = [
  { label: "Image", models: IMAGE_MODELS },
  { label: "Video", models: VIDEO_MODELS },
  { label: "Audio", models: AUDIO_MODELS },
  { label: "Studio", models: STUDIO_MODELS },
];
const ALL_MODELS = GROUPS.flatMap((g) => g.models);
const modelDef = (id: string) => ALL_MODELS.find((m) => m.id === id);
const modelName = (id: string) => modelDef(id)?.name ?? id;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/credit-pricing${path}`, init);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json as T;
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
    .replace(/Seconds|Minutes/, "")
    .trim()
    .toLowerCase()
    .replace(/^generate /, "");
/** {durationSeconds: 5, resolution: "720p", generateAudio: true} -> "5s · 720p · audio" */
const paramLabel = (p: Params) =>
  Object.entries(p)
    .map(([k, v]) => {
      if (typeof v === "boolean") return v ? humanKey(k) : `no ${humanKey(k)}`;
      if (/Seconds$/.test(k)) return `${v}s`;
      if (/Minutes$/.test(k)) return `${v} min`;
      if (k === "prompt") return `${Number(v).toLocaleString()} chars`;
      return String(v);
    })
    .join(" · ") || "Any input";

/** Only profit carries a color: red when we lose money, green otherwise. */
const profitTone = (m: number | null | undefined) =>
  m == null ? "text-white/40" : m < 0 ? "text-red-400" : "text-emerald-400";

const card = "rounded-2xl border border-white/[0.08] bg-[#161616]";

// ─── page ──────────────────────────────────────────────────────────────────────

export function CreditPricingStudio({
  schema,
  rules,
}: {
  schema: Record<string, Record<string, unknown[]>>;
  rules: CreditPricingRule[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [list, setList] = useState<ModelListItem[] | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = searchParams.get("model") ?? list?.[0]?.model ?? null;

  const select = useCallback(
    (model: string) => router.replace(`${pathname}?model=${encodeURIComponent(model)}`, { scroll: false }),
    [router, pathname],
  );

  const loadList = useCallback(() => {
    api<{ models: ModelListItem[] }>("/models")
      .then((r) => setList(r.models))
      .catch((e) => setError((e as Error).message));
  }, []);

  const loadOverview = useCallback(async (model: string) => {
    setLoading(true);
    try {
      setOverview(await api<Overview>(`/models/${encodeURIComponent(model)}`));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // `rules` changes after router.refresh(), e.g. a single option edited in the table below.
  useEffect(() => {
    loadList();
  }, [loadList, rules]);

  useEffect(() => {
    if (selected) void loadOverview(selected);
  }, [selected, loadOverview, rules]);

  // Refreshing the server data brings new `rules`, which reloads the overview and the list.
  const onApplied = () => router.refresh();

  // The owner (OWNER_EMAILS) gets the summary only: no per-option table or editing.
  const [isOwnerOnly, setIsOwnerOnly] = useState(false);
  useEffect(() => {
    fetch("/api/admin/releases/access")
      .then((r) => (r.ok ? r.json() : null))
      .then((a: { owner: boolean; dev: boolean } | null) => setIsOwnerOnly(!!a?.owner && !a?.dev))
      .catch(() => undefined);
  }, []);

  return (
    <div className="space-y-8">
      {error && <p className="text-[13px] text-red-400">{error}</p>}

      {overview && overview.model === selected ? (
        <div className={cn("space-y-10 transition-opacity", loading && "opacity-60")}>
          <ModelHeader
            overview={overview}
            picker={<ModelSelect list={list} selected={selected} onSelect={select} />}
          />
          {overview.derivedFrom ? (
            <DerivedNotice derived={overview.derivedFrom} onOpen={select} />
          ) : (
            <>
              <Section title="Overview" description="Averages across every option of this model.">
                <KpiGrid overview={overview} />
              </Section>
              <Section
                title="Edit Pricing"
                description="Change any value; the others follow, and every option of this model is repriced to match."
              >
                {/* Re-keyed on the prices so it starts from the new numbers after an apply. */}
                <ProfitCalculator
                  key={`${overview.model}:${overview.summary.avgCredits}:${overview.summary.priced}`}
                  overview={overview}
                  onApplied={onApplied}
                  showOptions={!isOwnerOnly}
                />
              </Section>
              {!isOwnerOnly && schema[overview.model] && (
                <Section title="Individual options" description="Set one option's credits by hand.">
                  <ModelPricingTable
                    modelId={overview.model}
                    modelSchema={schema[overview.model]}
                    existingRules={rules.filter((r) => r.model === overview.model)}
                  />
                </Section>
              )}
            </>
          )}
        </div>
      ) : (
        selected && (
          <div className={cn(card, "h-48 flex items-center justify-center text-white/40 text-sm gap-2")}>
            <Loader2 className="w-4 h-4 animate-spin" /> Loading {modelName(selected)}…
          </div>
        )
      )}
    </div>
  );
}

// ─── model select ──────────────────────────────────────────────────────────────

/** Button + menu: categories on the left, that category's models on the right. */
function ModelSelect({
  list,
  selected,
  onSelect,
}: {
  list: ModelListItem[] | null;
  selected: string | null;
  onSelect: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const groups = useMemo(() => {
    if (!list) return [];
    const known = new Set(ALL_MODELS.map((m) => m.id as string));
    const out = GROUPS.map((g) => ({
      label: g.label,
      items: list.filter((i) => g.models.some((m) => m.id === i.model)),
    }));
    const other = list.filter((i) => !known.has(i.model));
    if (other.length) out.push({ label: "Other", items: other });
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
          setOpen((o) => !o);
        }}
        aria-label="Change model"
        title="Change model"
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50",
          open ? "bg-white/[0.1] text-white" : "text-white/55 hover:bg-white/[0.06] hover:text-white",
        )}
      >
        <ChevronDown className={cn("w-6 h-6 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-[min(560px,calc(100vw-32px))] rounded-2xl border border-white/[0.1] bg-[#161616] shadow-2xl shadow-black/50 overflow-hidden flex">
          {/* Categories */}
          <div className="w-36 shrink-0 border-r border-white/[0.06] p-2 space-y-0.5">
            {groups.map((g) => (
              <button
                key={g.label}
                type="button"
                onMouseEnter={() => setCategory(g.label)}
                onClick={() => setCategory(g.label)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors",
                  g.label === activeCategory
                    ? "bg-white/[0.07] text-white font-semibold"
                    : "text-white/55 hover:text-white",
                )}
              >
                {g.label}
                <span className="text-[11px] text-white/30 font-normal">{g.items.length}</span>
              </button>
            ))}
          </div>

          {/* Models in the category */}
          <div className="flex-1 p-2 max-h-[420px] overflow-y-auto">
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
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                  )}
                >
                  <span className="w-6 h-6 shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                    {modelDef(item.model)?.svg}
                  </span>
                  <span className="flex-1 min-w-0 text-[13px] font-medium text-white truncate">
                    {modelName(item.model)}
                  </span>
                  {item.derivedFrom ? (
                    <span className="text-[11px] text-white/35">from {modelName(item.derivedFrom.model)}</span>
                  ) : (
                    <span className={cn("text-[12px] font-semibold tabular-nums", profitTone(item.avgMarkupPct))}>
                      {item.avgMarkupPct == null ? <span className="text-white/30 font-normal">no cost</span> : pct(item.avgMarkupPct)}
                    </span>
                  )}
                  {active && <Check className="w-4 h-4 text-white/60 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── header + KPIs ─────────────────────────────────────────────────────────────

function ModelHeader({ overview, picker }: { overview: Overview; picker: React.ReactNode }) {
  const { summary: s, derivedFrom } = overview;
  const def = modelDef(overview.model);
  // The page title: no card, just the model name large and a hairline under it.
  return (
    <header className="pb-8 border-b border-white/[0.06] flex items-center justify-between gap-6">
      <div className="flex items-center gap-5 min-w-0">
        <div className="w-16 h-16 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center [&>svg]:w-9 [&>svg]:h-9">
          {def?.svg}
        </div>
        <div className="min-w-0">
          <h1
            className="text-[36px] md:text-[48px] leading-none tracking-tight text-white truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {modelName(overview.model)}
          </h1>
          <p className="mt-3 text-[13px] text-white/45">
            Priced <span className="font-semibold text-white/75">{overview.unit}</span>
            {!derivedFrom && (
              <>
                {" · "}
                <span className="font-semibold text-white/75">{s.combinations}</span> option combinations
              </>
            )}
          </p>
        </div>
      </div>
      {picker}
    </header>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[17px] font-bold text-white">{title}</h2>
        {description && <p className="text-[13px] text-white/40 mt-0.5">{description}</p>}
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
    <div className={cn("rounded-2xl border p-5 min-w-0 flex items-center gap-3", a.card)}>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-white/55">{label}</p>
        <p className={cn("mt-2.5 text-[30px] font-bold leading-none tabular-nums truncate", tone ?? "text-white")}>
          {value}
        </p>
        {children && <p className="mt-3 text-[12px] text-white/40 leading-snug">{children}</p>}
      </div>
      <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", a.icon)}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

/** Bold figure inside a KPI's secondary line. */
const B = ({ children }: { children: React.ReactNode }) => (
  <span className="font-semibold text-white/70 tabular-nums">{children}</span>
);

function RangeLine({ r, f, empty }: { r: Range | null; f: (n: number) => string; empty: string }) {
  if (!r) return <>{empty}</>;
  if (r.min === r.max) return <>Same for every option</>;
  return (
    <>
      Range <B>{f(r.min)}</B> – <B>{f(r.max)}</B>
    </>
  );
}

function KpiGrid({ overview }: { overview: Overview }) {
  const s = overview.summary;
  const profitUsd = s.avgCostUsd != null && s.avgUserPaysUsd != null ? s.avgUserPaysUsd - s.avgCostUsd : null;
  const losing = (profitUsd ?? 0) < 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        <Kpi label="Costs us" value={usd(s.avgCostUsd)} accent="orange" icon={Receipt}>
          <RangeLine r={s.costRange} f={usd} empty="No costs in Model Costs" />
        </Kpi>
        <Kpi label="User pays" value={usd(s.avgUserPaysUsd)} accent="blue" icon={DollarSign}>
          {s.avgUserPaysUsd != null ? (
            <>
              At <B>{usd(overview.creditValue.perCredit)}</B> per credit
            </>
          ) : (
            "No credit prices set"
          )}
        </Kpi>
        <Kpi
          label="User pays in credits"
          value={s.avgCredits != null ? `${num(s.avgCredits)} cr` : "—"}
          accent="violet"
          icon={Coins}
        >
          <RangeLine r={s.creditsRange} f={(n) => `${num(n)} cr`} empty="No credit prices set" />
        </Kpi>
        <Kpi
          label="Profit"
          value={usd(profitUsd)}
          tone={profitTone(profitUsd)}
          accent={losing ? "red" : "emerald"}
          icon={TrendingUp}
        >
          {profitUsd != null ? <>Per use, on average</> : "Needs a cost and a credit price"}
        </Kpi>
        <Kpi
          label="Profit margin"
          value={pct(s.avgMarkupPct)}
          tone={profitTone(s.avgMarkupPct)}
          accent={losing ? "red" : "cyan"}
          icon={Percent}
        >
          <RangeLine r={s.markupRange} f={pct} empty="Needs a cost and a credit price" />
        </Kpi>
      </div>
      {(s.missingCost > 0 || s.missingCredits > 0) && (
        <p className="flex items-start gap-2 text-[12px] text-white/50">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            {s.missingCost > 0 && (
              <>
                <B>{s.missingCost}</B> of {s.combinations} options have no cost in Model Costs.{" "}
              </>
            )}
            {s.missingCredits > 0 && (
              <>
                <B>{s.missingCredits}</B> have no credit price yet.{" "}
              </>
            )}
            Averages only count options that have both.
          </span>
        </p>
      )}
    </div>
  );
}

function DerivedNotice({ derived, onOpen }: { derived: Derived; onOpen: (m: string) => void }) {
  return (
    <div className={cn(card, "p-5 flex flex-wrap items-center justify-between gap-4")}>
      <div>
        <p className="text-[15px] font-semibold text-white">Priced from {modelName(derived.model)}</p>
        <p className="text-[13px] text-white/50 mt-1">{derived.note}. Change that model&apos;s price instead.</p>
      </div>
      <button
        onClick={() => onOpen(derived.model)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white text-black text-[13px] font-semibold hover:bg-white/90"
      >
        Open {modelName(derived.model)} <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── calculator ────────────────────────────────────────────────────────────────

type Field = "margin" | "profit" | "price" | "credits";

function ProfitCalculator({
  overview,
  onApplied,
  showOptions,
}: {
  overview: Overview;
  onApplied: () => void;
  showOptions: boolean;
}) {
  const s = overview.summary;
  const perCredit = overview.creditValue.perCredit;
  // Same rows the backend averages over when repricing: every option with a cost.
  const costed = overview.rows.filter((r) => r.costUsd != null && r.costUsd > 0);
  const avgCost = costed.length ? costed.reduce((a, r) => a + r.costUsd!, 0) / costed.length : null;
  const canCalc = avgCost != null && perCredit > 0;

  // Starts at the model's current numbers.
  const [values, setValues] = useState<Record<Field, string>>(() => ({
    margin: s.avgMarkupPct != null ? num(s.avgMarkupPct) : "",
    profit: s.avgUserPaysUsd != null && s.avgCostUsd != null ? (s.avgUserPaysUsd - s.avgCostUsd).toFixed(3) : "",
    price: s.avgUserPaysUsd != null ? s.avgUserPaysUsd.toFixed(3) : "",
    credits: s.avgCredits != null ? num(s.avgCredits) : "",
  }));
  // `typed` is the field the user changed and its text. Nothing is requested until then,
  // and filling the other three fields from a preview doesn't trigger another one.
  const [typed, setTyped] = useState<{ field: Field; value: string } | null>(null);
  const editing = typed?.field ?? null;
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const seq = useRef(0);

  /** What to send for the typed field: credits go as-is, the rest become a markup. */
  const request = useMemo((): { markupPct: number } | { avgCredits: number } | null => {
    if (!typed || avgCost == null) return null;
    const v = Number(typed.value);
    if (typed.value.trim() === "" || !Number.isFinite(v)) return null;
    switch (typed.field) {
      case "margin":
        return { markupPct: v };
      case "profit":
        return { markupPct: (v / avgCost) * 100 };
      case "price":
        return v > 0 ? { markupPct: (v / avgCost - 1) * 100 } : null;
      case "credits":
        return v > 0 ? { avgCredits: v } : null;
    }
  }, [typed, avgCost]);

  // Live preview, debounced. The other three fields follow the result.
  useEffect(() => {
    const req = request;
    if (!canCalc || !req) {
      setPreview(null);
      return;
    }
    const id = ++seq.current;
    const t = setTimeout(async () => {
      setPreviewing(true);
      try {
        const p = await api<Preview>(`/models/${encodeURIComponent(overview.model)}/reprice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...req, dryRun: true }),
        });
        if (id !== seq.current) return;
        setPreview(p);
        setPreviewError(null);
        const pays = p.avgCredits != null ? p.avgCredits * perCredit : null;
        setValues((prev) => ({
          margin: editing === "margin" ? prev.margin : num(p.avgMarkupPct ?? p.markupPct),
          profit: editing === "profit" || pays == null || avgCost == null ? prev.profit : (pays - avgCost).toFixed(3),
          price: editing === "price" || pays == null ? prev.price : pays.toFixed(3),
          credits: editing === "credits" || p.avgCredits == null ? prev.credits : num(p.avgCredits),
        }));
      } catch (e) {
        if (id === seq.current) setPreviewError((e as Error).message);
      } finally {
        if (id === seq.current) setPreviewing(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [request, canCalc, overview.model, editing, perCredit, avgCost]);

  const onType = (field: Field, raw: string) => {
    const value = raw.replace(/[^\d.-]/g, "");
    setValues((prev) => ({ ...prev, [field]: value }));
    setTyped({ field, value });
  };

  const changed = preview?.rows.filter((r) => !r.skipped && r.newCredits !== r.credits).length ?? 0;
  const newAvgPays = preview?.avgCredits != null ? preview.avgCredits * perCredit : null;
  const newAvgProfit = newAvgPays != null && avgCost != null ? newAvgPays - avgCost : null;

  const apply = async () => {
    const req = request;
    if (!req) return;
    setConfirming(false);
    setApplying(true);
    try {
      const r = await api<{ updated: number; created: number; markupPct: number }>(
        `/models/${encodeURIComponent(overview.model)}/reprice`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req) },
      );
      toast.success(`${modelName(overview.model)} set to ${pct(r.markupPct)} profit · ${r.updated} updated, ${r.created} added`);
      onApplied();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  // Title on top, then the bare value: no box, no border.
  const input = (field: Field, label: string, prefix: string, suffix: string) => (
    <label className="block min-w-0 cursor-text">
      <span className={cn("block text-[12px] font-medium", editing === field ? "text-white/80" : "text-white/45")}>
        {label}
      </span>
      <span className="mt-1 flex items-baseline gap-1 min-w-0">
        {prefix && <span className="text-[20px] font-bold text-white/40">{prefix}</span>}
        <input
          inputMode="decimal"
          value={values[field]}
          disabled={!canCalc}
          onChange={(e) => onType(field, e.target.value)}
          className="w-full min-w-0 bg-transparent p-0 border-0 text-[22px] font-bold text-white outline-none tabular-nums placeholder:text-white/15 disabled:opacity-40"
          placeholder="0"
        />
        {suffix && <span className="text-[14px] font-semibold text-white/40">{suffix}</span>}
      </span>
    </label>
  );

  return (
    // Secondary to the overview cards: outline only, no fill.
    <div className="relative rounded-2xl border border-white/[0.07] p-6 space-y-6">
      {previewing && <Loader2 className="absolute top-5 right-5 w-4 h-4 animate-spin text-white/40" />}

      {!canCalc ? (
        <p className="text-[13px] text-white/50">
          This model has no costs in <span className="font-semibold text-white/80">Model Costs</span> yet. Add them
          there first, then set the profit here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-5">
            {input("price", "Avg price", "$", "")}
            {input("credits", "Avg price in credits", "", "credits")}
            {input("profit", "Avg profit", "$", "")}
            {input("margin", "Avg profit margin", "", "%")}
          </div>

          {previewError && <p className="text-[13px] text-red-400">{previewError}</p>}

          {preview && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 rounded-xl bg-white/[0.025] divide-x divide-white/[0.05]">
                <SmallStat label="Avg price" value={usd(newAvgPays)} />
                <SmallStat label="Avg price in credits" value={`${num(preview.avgCredits)} cr`} />
                <SmallStat label="Avg profit" value={usd(newAvgProfit)} tone={profitTone(newAvgProfit)} />
                <SmallStat
                  label="Avg profit margin"
                  value={pct(preview.avgMarkupPct)}
                  tone={profitTone(preview.avgMarkupPct)}
                />
              </div>

              {showOptions && (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-[13px]">
                      <thead className="sticky top-0 bg-[#1b1b1b] text-[11px] uppercase tracking-wider text-white/40 text-left">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Option</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Costs us</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Credits</th>
                          <th className="px-4 py-2.5 font-semibold text-right">User pays</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Profit</th>
                          <th className="px-4 py-2.5 font-semibold text-right">Margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {preview.rows.map((r, i) => {
                          const profit =
                            r.newUserPaysUsd != null && r.costUsd != null ? r.newUserPaysUsd - r.costUsd : null;
                          return (
                            <tr key={i} className={cn(r.skipped && "opacity-40")}>
                              <td className="px-4 py-2.5 font-medium text-white/85">{paramLabel(r.parameters)}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-white/55">{usd(r.costUsd)}</td>
                              <td className="px-4 py-2.5 text-right tabular-nums">
                                {r.skipped ? (
                                  <span className="text-white/40">no cost · {num(r.credits)}</span>
                                ) : (
                                  <>
                                    {r.newCredits !== r.credits && (
                                      <>
                                        <span className="text-white/35 line-through">{num(r.credits)}</span>{" "}
                                      </>
                                    )}
                                    <span className="font-semibold text-white">{num(r.newCredits)}</span>
                                  </>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{usd(r.newUserPaysUsd)}</td>
                              <td className={cn("px-4 py-2.5 text-right tabular-nums font-semibold", profitTone(profit))}>
                                {r.skipped ? "—" : usd(profit)}
                              </td>
                              <td className={cn("px-4 py-2.5 text-right tabular-nums font-semibold", profitTone(r.newMarkupPct))}>
                                {r.skipped ? "—" : pct(r.newMarkupPct)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-white/45">
                  {preview.skipped.length > 0 && (
                    <>
                      <span className="font-semibold text-white/70">{preview.skipped.length}</span> option
                      {preview.skipped.length === 1 ? "" : "s"} without a cost will keep their current credits.
                    </>
                  )}
                </p>
                <button
                  disabled={applying || previewing || changed === 0}
                  onClick={() => setConfirming(true)}
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:hover:bg-primary"
                >
                  {applying && <Loader2 className="w-4 h-4 animate-spin" />}
                  Apply
                </button>
              </div>

              <ConfirmPricingDialog
                open={confirming}
                onClose={() => setConfirming(false)}
                onConfirm={apply}
                modelLabel={modelName(overview.model)}
                changed={changed}
                rows={[
                  { label: "Avg price", before: usd(s.avgUserPaysUsd), after: usd(newAvgPays) },
                  {
                    label: "Avg price in credits",
                    before: s.avgCredits != null ? `${num(s.avgCredits)} cr` : "—",
                    after: `${num(preview.avgCredits)} cr`,
                  },
                  {
                    label: "Avg profit",
                    before: usd(s.avgUserPaysUsd != null && s.avgCostUsd != null ? s.avgUserPaysUsd - s.avgCostUsd : null),
                    after: usd(newAvgProfit),
                  },
                  { label: "Avg profit margin", before: pct(s.avgMarkupPct), after: pct(preview.avgMarkupPct) },
                ]}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

const CONFIRM_DELAY_SECONDS = 10;

/** Old vs new averages; Confirm unlocks after a 10-second countdown. */
function ConfirmPricingDialog({
  open,
  onClose,
  onConfirm,
  modelLabel,
  changed,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  modelLabel: string;
  changed: number;
  rows: { label: string; before: string; after: string }[];
}) {
  const [left, setLeft] = useState(CONFIRM_DELAY_SECONDS);

  useEffect(() => {
    if (!open) return;
    const started = Date.now();
    const tick = () => setLeft(Math.max(0, CONFIRM_DELAY_SECONDS - Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[520px] bg-[#141414] border-white/[0.08]">
        <DialogHeader>
          <DialogTitle className="text-white">Apply new pricing to {modelLabel}?</DialogTitle>
          <DialogDescription className="text-white/50">
            {changed} option{changed === 1 ? "" : "s"} will get new credit prices. Users are charged the new prices
            right away.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold" />
                <th className="px-4 py-2.5 text-right font-semibold">Current</th>
                <th className="px-4 py-2.5 text-right font-semibold">New</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-3 text-white/60">{r.label}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-white/45">{r.before}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-white">{r.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-xl text-[13px] font-semibold text-white/70 hover:bg-white/[0.06]"
          >
            Cancel
          </button>
          <button
            disabled={left > 0}
            onClick={onConfirm}
            className="h-10 min-w-[140px] px-5 rounded-xl text-[13px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed tabular-nums"
          >
            {left > 0 ? `Confirm (${left}s)` : "Confirm"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SmallStat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-[12px] font-medium text-white/40">{label}</p>
      <p className={cn("mt-1 text-[17px] font-bold tabular-nums leading-tight", tone ?? "text-white")}>{value}</p>
      {sub && <p className="text-[12px] text-white/35 tabular-nums">{sub}</p>}
    </div>
  );
}
