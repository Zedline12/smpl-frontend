"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clapperboard, Film, Image as ImageIcon, Info, Layers, Loader2, Sparkles, Wand2 } from "lucide-react";
import { billingPeriod, SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { cn } from "@/lib/utils";

// ─── What people make, and what each thing costs ─────────────────────────────

type GoalId = "viral" | "product" | "cinematic" | "personal";
type ContentId = "gensu" | "kling" | "seedance" | "image";

const GOALS: { id: GoalId; label: string; content: ContentId[] }[] = [
  { id: "viral", label: "Viral content & Gensu", content: ["gensu", "image"] },
  { id: "product", label: "Product photos & videos", content: ["image", "kling"] },
  { id: "cinematic", label: "Cinematic videos", content: ["seedance"] },
  { id: "personal", label: "Personal use", content: ["image", "kling"] },
];

interface ContentType {
  id: ContentId;
  /** "~45 Seedance videos" */
  noun: string;
  kind: "video" | "image";
  icon: typeof Film;
  max: number;
  step: number;
  initial: number;
  /** Priced live through the cost endpoint; `fallback` if that fails. */
  model: string;
  input: Record<string, unknown>;
  fallback: number;
}

const CONTENT: Record<ContentId, ContentType> = {
  gensu: { id: "gensu", noun: "Gensu videos (10s)", kind: "video", icon: Wand2, max: 100, step: 5, initial: 20, model: "smpl-gensu", input: { duration: 10, resolution: "720p" }, fallback: 30 },
  kling: { id: "kling", noun: "Kling 3.0 videos (5s)", kind: "video", icon: Film, max: 100, step: 5, initial: 20, model: "kling-v3-image-to-video", input: { duration: 5, generateAudio: true }, fallback: 14 },
  seedance: { id: "seedance", noun: "Seedance 2.5 videos (10s)", kind: "video", icon: Clapperboard, max: 100, step: 5, initial: 25, model: "seedance-2.5", input: { duration: 10, resolution: "720p" }, fallback: 20 },
  image: { id: "image", noun: "Nano Banana Pro images", kind: "image", icon: ImageIcon, max: 300, step: 10, initial: 60, model: "gemini-flash-image", input: { resolution: "1K", prompt: "" }, fallback: 2 },
};

/** Live credit cost per item, falling back to built-in numbers (e.g. logged out). */
function useCreditCosts(): Record<ContentId, number> {
  const [costs, setCosts] = useState<Record<ContentId, number>>(() =>
    Object.fromEntries(Object.values(CONTENT).map((c) => [c.id, c.fallback])) as Record<ContentId, number>,
  );
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Object.values(CONTENT).map(async (c) => {
        try {
          const res = await fetch("/api/generation/calculate-cost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: c.model, input: c.input }),
          });
          const json = await res.json().catch(() => null);
          const credits = Number((json?.data ?? json)?.creditsCost);
          return [c.id, res.ok && credits > 0 ? credits : c.fallback] as const;
        } catch {
          return [c.id, c.fallback] as const;
        }
      }),
    ).then((entries) => {
      if (!cancelled) setCosts(Object.fromEntries(entries) as Record<ContentId, number>);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return costs;
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

const formatCents = (cents: number) => {
  const dollars = cents / 100;
  return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)}`;
};

function Step({ n, title, hint, info, last, children }: { n: number; title: string; hint?: string; info?: string; last?: boolean; children: React.ReactNode }) {
  return (
    <div className="relative flex gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/80">
          {n}
        </span>
        {!last && <span className="mt-2 w-px flex-1 border-l border-dashed border-white/15" />}
      </div>
      <div className={cn("min-w-0 flex-1", !last && "pb-9")}>
        <h3 className="flex items-center gap-2 text-[22px] font-semibold text-white sm:text-[26px]" style={{ fontFamily: "var(--font-display)" }}>
          {title}
          {info && (
            <span title={info} className="text-white/35">
              <Info className="size-4" />
            </span>
          )}
        </h3>
        {hint && <p className="mt-1 text-sm text-white/45">{hint}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

/** The segmented bar: click or drag anywhere on it. */
function SegmentSlider({ value, max, step, onChange, label }: { value: number; max: number; step: number; onChange: (v: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const segments = Math.round(max / step);
  const lit = Math.round(value / step);

  const setFromPointer = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    onChange(Math.round((ratio * max) / step) * step);
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromPointer(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) setFromPointer(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange(Math.min(max, value + step));
        if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange(Math.max(0, value - step));
      }}
      className="flex h-7 cursor-pointer touch-none items-center gap-[3px] rounded outline-none select-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-full flex-1 rounded-full transition-colors duration-150",
            i < lit ? "bg-primary shadow-[0_0_8px_var(--color-primary)]" : "bg-white/15",
          )}
          style={{ maxWidth: 4 }}
        />
      ))}
    </div>
  );
}

function UsageDots({ fraction }: { fraction: number }) {
  const total = 24;
  const lit = Math.round(Math.min(1, fraction) * total);
  return (
    <div className="grid grid-cols-8 gap-1">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("size-2.5 rounded-[3px]", i < lit ? "bg-primary" : "bg-white/12")} />
      ))}
    </div>
  );
}

/** Same colours as the plan cards: Starter grey, Creator secondary, Pro primary. */
type Tier = "starter" | "creator" | "pro";
const TIERS: Tier[] = ["starter", "creator", "pro"];
function tierOf(plan: SubscriptionPlan, index: number): Tier {
  if (/pro/i.test(plan.name)) return "pro";
  if (/creator/i.test(plan.name)) return "creator";
  if (/starter|basic/i.test(plan.name)) return "starter";
  return TIERS[Math.min(index, TIERS.length - 1)];
}
const TIER_LOOK: Record<Tier, { color: string; glow: boolean }> = {
  starter: { color: "#3f3f46", glow: false },
  creator: { color: "var(--color-secondary)", glow: true },
  pro: { color: "var(--color-primary)", glow: true },
};

// ─── The section ─────────────────────────────────────────────────────────────

interface PlanFinderProps {
  plans: SubscriptionPlan[];
  period: billingPeriod;
  onPeriodChange: (p: billingPeriod) => void;
  onSubscribe: (planId: string) => void;
  processingPlanId: string | null;
  /** The user's current paid plan, if any. */
  currentPlanId?: string | null;
}

export function PlanFinder({ plans, period, onPeriodChange, onSubscribe, processingPlanId, currentPlanId }: PlanFinderProps) {
  const costs = useCreditCosts();
  const [goals, setGoals] = useState<GoalId[]>(["viral"]);
  const [counts, setCounts] = useState<Record<ContentId, number>>(
    () => Object.fromEntries(Object.values(CONTENT).map((c) => [c.id, c.initial])) as Record<ContentId, number>,
  );

  const toggleGoal = (id: GoalId) =>
    setGoals((prev) => (prev.includes(id) ? (prev.length > 1 ? prev.filter((g) => g !== id) : prev) : [...prev, id]));

  // One slider per content type the chosen goals need.
  const sliders = useMemo(() => {
    const ids = [...new Set(goals.flatMap((g) => GOALS.find((x) => x.id === g)!.content))];
    return ids.map((id) => CONTENT[id]).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "video" ? -1 : 1));
  }, [goals]);

  const usage = sliders.reduce((sum, c) => sum + counts[c.id] * costs[c.id], 0);

  const periodPlans = plans
    .filter((p) => p.billingPeriod === period && p.priceAmount > 0)
    .sort((a, b) => (a.creditsPerMonth ?? 0) - (b.creditsPerMonth ?? 0));
  const fits = periodPlans.find((p) => (p.creditsPerMonth ?? 0) >= usage);
  const plan = fits ?? periodPlans[periodPlans.length - 1];
  const needsTopUp = !fits && usage > 0;
  const look = TIER_LOOK[plan ? tierOf(plan, periodPlans.indexOf(plan)) : "pro"];

  const isYearly = period === billingPeriod.YEARLY;
  const monthly = plan && plans.find((p) => p.name === plan.name && p.billingPeriod === billingPeriod.MONTHLY);
  const perMonth = plan ? (isYearly ? plan.priceAmount / 12 : plan.priceAmount) : 0;
  const monthlyPrice = monthly?.priceAmount ?? 0;
  const discountPct = isYearly && monthlyPrice > 0 ? Math.round((1 - perMonth / monthlyPrice) * 100) : 0;
  const yearlySavings = isYearly ? monthlyPrice * 12 - (plan?.priceAmount ?? 0) : 0;
  const maxYearlyDiscount = Math.max(
    0,
    ...plans
      .filter((p) => p.billingPeriod === billingPeriod.YEARLY && p.priceAmount > 0)
      .map((y) => {
        const m = plans.find((p) => p.name === y.name && p.billingPeriod === billingPeriod.MONTHLY)?.priceAmount ?? 0;
        return m ? Math.round((1 - y.priceAmount / 12 / m) * 100) : 0;
      }),
  );

  const videoCost = sliders.find((s) => s.kind === "video");
  const hint = [
    videoCost ? `${costs[videoCost.id]} credits per video` : null,
    sliders.some((s) => s.kind === "image") ? `${costs.image} credits per image` : null,
  ]
    .filter(Boolean)
    .join(" & ");

  if (!periodPlans.length) return null;

  return (
    <section className="mx-auto mt-24 max-w-[1100px] px-4">
      <div className="mb-10 text-center">
        <h2 className="text-[34px] font-extrabold tracking-tight text-white md:text-[44px]" style={{ fontFamily: "var(--font-display)" }}>
          Find the best plan for you
        </h2>
        <p className="mt-2 text-[15px] text-white/50">Tell us what you make and how much — we&apos;ll pick the plan that fits.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Questions */}
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] p-5 sm:p-7">
          <Step n={1} title="What are you here to make?" hint="Pick as many as you like">
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((g) => {
                const on = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleGoal(g.id)}
                    className={cn(
                      "flex min-h-[104px] flex-col justify-between rounded-2xl border p-4 text-left transition-colors",
                      on ? "border-primary bg-primary/[0.08] shadow-[0_0_0_1px_var(--color-primary)]" : "border-white/[0.08] bg-white/[0.03] hover:border-white/20",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-md border transition-colors",
                        on ? "border-primary bg-primary text-white" : "border-white/25",
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="text-[15px] leading-snug font-semibold text-white">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </Step>

          <Step n={2} title="How much content per month?" hint={hint ? `Approximately ${hint}` : undefined} info="Credit costs depend on the model and settings; these are typical ones." last>
            <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4">
              {sliders.map((c) => {
                const Icon = c.icon;
                const count = counts[c.id];
                return (
                  <div key={c.id} className="py-4">
                    <SegmentSlider
                      label={c.noun}
                      value={count}
                      max={c.max}
                      step={c.step}
                      onChange={(v) => setCounts((prev) => ({ ...prev, [c.id]: v }))}
                    />
                    <p className="mt-2.5 flex items-center gap-2 text-sm text-white">
                      <Icon className="text-primary size-4" />
                      <span className="font-semibold">
                        ~{count} {c.noun}
                      </span>
                      <span className="text-white/45">{(count * costs[c.id]).toLocaleString()} credits</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </Step>
        </div>

        {/* Recommendation */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0f0f12] p-5 sm:p-7">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          {/* Monthly / Annual */}
          <div className="relative mx-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm">
            <button type="button" onClick={() => onPeriodChange(billingPeriod.MONTHLY)} className={cn("font-medium", !isYearly ? "text-white" : "text-white/45")}>
              Monthly
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              aria-label="Bill annually"
              onClick={() => onPeriodChange(isYearly ? billingPeriod.MONTHLY : billingPeriod.YEARLY)}
              className={cn("relative h-5 w-9 rounded-full transition-colors", isYearly ? "bg-primary" : "bg-white/20")}
            >
              <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform", isYearly && "translate-x-4")} />
            </button>
            <button type="button" onClick={() => onPeriodChange(billingPeriod.YEARLY)} className={cn("font-medium", isYearly ? "text-white" : "text-white/45")}>
              Annual
            </button>
            {maxYearlyDiscount > 0 && <span className="text-primary text-xs font-semibold">Save up to {maxYearlyDiscount}%</span>}
          </div>

          {plan && (
            <div className="relative mx-auto mt-10 w-full max-w-[360px]">
              {look.glow && (
                <div className="pointer-events-none absolute -inset-4 rounded-[32px] opacity-40 blur-2xl transition-colors" style={{ background: look.color }} />
              )}
              <div
                className="relative rounded-3xl p-5 text-white transition-[background,box-shadow] duration-300"
                style={{
                  background: `linear-gradient(150deg, color-mix(in srgb, ${look.color} 85%, white) 0%, ${look.color} 45%, color-mix(in srgb, ${look.color} 70%, black) 100%)`,
                  boxShadow: look.glow ? `0 20px 60px -20px ${look.color}` : undefined,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[34px] leading-none font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {plan.name}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-black/25 px-2.5 py-1 text-sm font-semibold">
                    <Sparkles className="size-3.5" />
                    {(plan.creditsPerMonth ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  {discountPct > 0 && <span className="text-[28px] font-bold text-white/55 line-through decoration-2">{formatCents(monthlyPrice)}</span>}
                  <span className="text-[38px] leading-none font-extrabold">{formatCents(perMonth)}</span>
                  <span className="text-sm text-white/80">/mo{isYearly ? " billed yearly" : ""}</span>
                </div>
                {plan.id === currentPlanId ? (
                  <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-white/90 py-3 text-sm font-semibold text-black">
                    <Check className="size-4" /> Your plan
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!!processingPlanId}
                    onClick={() => onSubscribe(plan.id)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {processingPlanId === plan.id && <Loader2 className="size-4 animate-spin" />}
                    Get {plan.name}
                    {discountPct > 0 && (
                      <span className="bg-primary rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white">
                        −{discountPct}% · Save {formatCents(yearlySavings)}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {plan && (
            <div className="relative mx-auto mt-8 w-full max-w-[360px]">
              <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                <div>
                  <p className="text-sm text-white/45">Expected monthly usage</p>
                  <p className="mt-0.5 font-semibold text-white">
                    {Math.round(usage).toLocaleString()} of {(plan.creditsPerMonth ?? 0).toLocaleString()} credits
                  </p>
                </div>
                <UsageDots fraction={(plan.creditsPerMonth ?? 0) > 0 ? usage / (plan.creditsPerMonth ?? 1) : 0} />
              </div>
              {needsTopUp && (
                <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                  That&apos;s more than our biggest plan. Top up with credit packs for the extra{" "}
                  {Math.round(usage - (plan.creditsPerMonth ?? 0)).toLocaleString()} credits.
                </p>
              )}
              <p className="mt-4 text-sm text-white/45">Included in plan</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5 text-white">
                  <span className="bg-primary flex size-4.5 items-center justify-center rounded-full">
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </span>
                  <span className="font-medium">{(plan.creditsPerMonth ?? 0).toLocaleString()} credits</span>
                  <span className="text-white/45">/ month</span>
                </li>
                <li className="flex items-center gap-2.5 text-white">
                  <span className="bg-primary flex size-4.5 items-center justify-center rounded-full">
                    <Check className="size-3 text-white" strokeWidth={3} />
                  </span>
                  {plan.maxConcurrentJobs && plan.maxConcurrentJobs > 1
                    ? `${plan.maxConcurrentJobs} generations at once`
                    : "1 generation at a time"}
                </li>
                <li className="flex items-center gap-2.5 text-white">
                  <span className="bg-primary flex size-4.5 items-center justify-center rounded-full">
                    <Layers className="size-2.5 text-white" strokeWidth={3} />
                  </span>
                  Credit packs to top up anytime
                </li>
                <li className="flex items-center gap-2.5 text-white">
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-white">
                    <Check className="size-3 text-black" strokeWidth={3} />
                  </span>
                  All models &amp; features
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
