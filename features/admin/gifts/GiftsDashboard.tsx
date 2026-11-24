"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeDollarSign,
  CalendarClock,
  Coins,
  Gift,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Trash2,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { KpiTile } from "@/features/admin/components/data-viz/kpi";
import { int, pct, usd } from "@/features/admin/components/data-viz/format";
import {
  Field,
  Segmented,
  TextInput,
  isoToLocalInput,
  localInputToIso,
} from "@/features/admin/appearance/components/home-sections/fields";

type Period = "day" | "week" | "month" | "lifetime";
type Status = "active" | "scheduled" | "ended" | "disabled";

interface Campaign {
  id: string;
  name: string;
  credits: number;
  enabled: boolean;
  startsAt: string | null;
  endsAt: string | null;
  status: Status;
  usersGifted: number;
  creditsGiven: number;
}

interface Stats {
  usersGifted: number;
  creditsGiven: number;
  usdGivenCents: number;
  subscribed: number;
  subscribedRate: number;
  creditsUsed: number;
  avgUsedRate: number;
  usedAll: number;
  usedNone: number;
  realCostCents: number;
}

interface Quote {
  perCreditCents: number;
  models: { id: string; name: string; minCredits: number; unit: string }[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "Last day" },
  { key: "week", label: "Last week" },
  { key: "month", label: "Last month" },
  { key: "lifetime", label: "Lifetime" },
];

const STATUS_STYLE: Record<Status, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  scheduled: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  ended: "bg-white/[0.06] text-white/50 border-white/10",
  disabled: "bg-white/[0.06] text-white/40 border-white/10",
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/admin/gifts${path}`, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Request failed");
  return json as T;
}

const dateText = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : null;

function windowText(c: Pick<Campaign, "startsAt" | "endsAt">) {
  if (!c.startsAt && !c.endsAt) return "Always";
  if (c.startsAt && c.endsAt) return `${dateText(c.startsAt)} → ${dateText(c.endsAt)}`;
  if (c.startsAt) return `From ${dateText(c.startsAt)}`;
  return `Until ${dateText(c.endsAt)}`;
}

/**
 * Admin → Gifts: credits for new Google sign-ups. Numbers for the period, the campaigns
 * (only one can be on at a time), and a form that works in credits or dollars.
 */
export function GiftsDashboard() {
  const qc = useQueryClient();
  const [period, setPeriod] = useState<Period>("month");
  const [campaignId, setCampaignId] = useState<string>("");
  const [editing, setEditing] = useState<Campaign | "new" | null>(null);

  const campaigns = useQuery({ queryKey: ["admin-gifts"], queryFn: () => api<Campaign[]>("") });
  const quote = useQuery({ queryKey: ["admin-gifts-quote"], queryFn: () => api<Quote>("/quote"), staleTime: 5 * 60_000 });
  const statsKey = ["admin-gifts-stats", period, campaignId];
  const stats = useQuery({
    queryKey: statsKey,
    queryFn: () => api<Stats>(`/stats?period=${period}${campaignId ? `&campaignId=${campaignId}` : ""}`),
  });

  const refresh = async () => {
    try {
      const fresh = await api<Stats>(`/stats?period=${period}${campaignId ? `&campaignId=${campaignId}` : ""}&refresh=1`);
      qc.setQueryData(statsKey, fresh);
      void qc.invalidateQueries({ queryKey: ["admin-gifts"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggle = useMutation({
    mutationFn: (c: Campaign) => api(`/${c.id}`, { method: "PATCH", body: JSON.stringify({ enabled: !c.enabled }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-gifts"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (c: Campaign) => api(`/${c.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Gift deleted");
      void qc.invalidateQueries({ queryKey: ["admin-gifts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = stats.data;
  const active = campaigns.data?.find((c) => c.status === "active");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Gift className="size-6 text-pink-400" /> Gifts
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/50">
            Free credits for new accounts made with Google (email sign-ups don&apos;t get them).{" "}
            {active ? (
              <>
                On now: <span className="font-semibold text-white">{active.name}</span> ·{" "}
                {int(active.credits)} credits.
              </>
            ) : (
              "No gift is on right now."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> New gift
        </button>
      </div>

      {/* Numbers */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-white/[0.08] bg-[#161616] p-1">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={cn(
                  "h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors",
                  period === p.key ? "bg-white/[0.1] text-white" : "text-white/50 hover:text-white",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <select
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="h-10 rounded-xl border border-white/[0.08] bg-[#161616] px-3 text-[13px] text-white"
          >
            <option value="">All gifts</option>
            {campaigns.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            className="ml-auto flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 text-[13px] text-white/60 hover:text-white"
          >
            <RefreshCw className={cn("size-4", stats.isFetching && "animate-spin")} /> Refresh
          </button>
        </div>

        {stats.isError ? (
          <p className="text-sm text-red-300">{(stats.error as Error).message}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <KpiTile label="Users gifted" value={s ? int(s.usersGifted) : "…"} accent="violet" icon={Users} />
            <KpiTile label="Credits given" value={s ? int(s.creditsGiven) : "…"} accent="blue" icon={Coins} />
            <KpiTile label="Value given" value={s ? usd(s.usdGivenCents) : "…"} accent="amber" icon={BadgeDollarSign}>
              At the cheapest paid credit when given.
            </KpiTile>
            <KpiTile label="Subscribed after" value={s ? int(s.subscribed) : "…"} accent="emerald" icon={UserCheck}>
              {s ? `${pct(s.subscribedRate)} of gifted users started a paid plan.` : null}
            </KpiTile>
            <KpiTile label="Gift used, on average" value={s ? pct(s.avgUsedRate, 0) : "…"} accent="cyan" icon={Percent}>
              {s
                ? `${int(s.creditsUsed)} of ${int(s.creditsGiven)} credits used · ${int(s.usedAll)} used it all · ${int(s.usedNone)} didn't use it`
                : null}
            </KpiTile>
            <KpiTile label="Real cost" value={s ? usd(s.realCostCents) : "…"} accent="red" icon={Wallet}>
              What gifted users&apos; generations cost at the providers.
            </KpiTile>
          </div>
        )}
      </section>

      {/* Campaigns */}
      <section className="space-y-3">
        <h2 className="text-[17px] font-bold text-white">Gift campaigns</h2>
        {campaigns.isLoading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : !campaigns.data?.length ? (
          <p className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-white/45">
            No gifts yet. Create one to give new Google sign-ups free credits.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161616]">
            {campaigns.data.map((c, i) => (
              <div
                key={c.id}
                className={cn("flex flex-wrap items-center gap-4 px-5 py-4", i > 0 && "border-t border-white/[0.06]")}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">{c.name}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", STATUS_STYLE[c.status])}>
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-white/45">
                    <CalendarClock className="size-3.5" /> {windowText(c)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white tabular-nums">{int(c.credits)} credits</p>
                  {quote.data && (
                    <p className="text-xs text-white/40">{usd(c.credits * quote.data.perCreditCents)} each</p>
                  )}
                </div>
                <div className="w-28 text-right text-xs text-white/50">
                  {int(c.usersGifted)} users
                  <br />
                  {int(c.creditsGiven)} credits
                </div>
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    disabled={toggle.isPending}
                    onChange={() => toggle.mutate(c)}
                  />
                  On
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    aria-label="Edit"
                    className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-white/60 hover:text-white"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${c.name}"?`)) remove.mutate(c);
                    }}
                    disabled={c.usersGifted > 0}
                    title={c.usersGifted > 0 ? "People got this gift: turn it off instead" : "Delete"}
                    aria-label="Delete"
                    className="flex size-8 items-center justify-center rounded-lg border border-white/10 text-red-300/80 hover:text-red-300 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <GiftForm
        open={editing !== null}
        campaign={editing === "new" ? null : editing}
        quote={quote.data ?? null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          void qc.invalidateQueries({ queryKey: ["admin-gifts"] });
        }}
      />
    </div>
  );
}

type Unit = "credits" | "usd";

function GiftForm({
  open,
  campaign,
  quote,
  onClose,
  onSaved,
}: {
  open: boolean;
  campaign: Campaign | null;
  quote: Quote | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState(50);
  const [unit, setUnit] = useState<Unit>("credits");
  const [usdText, setUsdText] = useState("");
  const [always, setAlways] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [enabled, setEnabled] = useState(true);

  // Start from the campaign (or blank) each time the form opens.
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(campaign?.name ?? "");
      setCredits(campaign?.credits ?? 50);
      setUnit("credits");
      setUsdText("");
      setAlways(!campaign?.startsAt && !campaign?.endsAt);
      setStartsAt(isoToLocalInput(campaign?.startsAt ?? null));
      setEndsAt(isoToLocalInput(campaign?.endsAt ?? null));
      setEnabled(campaign?.enabled ?? true);
    }
  }

  const perCredit = quote?.perCreditCents ?? 0;
  const usdValueCents = credits * perCredit;
  const affordable = useMemo(
    () => (quote?.models ?? []).filter((m) => m.minCredits <= credits),
    [quote, credits],
  );

  const setFromUsd = (text: string) => {
    setUsdText(text);
    const dollars = Number(text);
    if (perCredit > 0 && dollars > 0) setCredits(Math.max(1, Math.round((dollars * 100) / perCredit)));
  };

  const save = useMutation({
    mutationFn: () => {
      const body = {
        name: name.trim(),
        credits,
        enabled,
        startsAt: always ? null : localInputToIso(startsAt),
        endsAt: always ? null : localInputToIso(endsAt),
      };
      return campaign
        ? api(`/${campaign.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : api("", { method: "POST", body: JSON.stringify(body) });
    },
    onSuccess: () => {
      toast.success(campaign ? "Gift saved" : "Gift created");
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const valid = name.trim().length > 0 && credits >= 1 && (always || startsAt || endsAt);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-5 overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-6 sm:max-w-2xl">
        <div className="pr-10">
          <DialogTitle className="text-xl font-bold text-white">{campaign ? "Edit gift" : "New gift"}</DialogTitle>
          <DialogDescription className="text-sm text-white/50">
            Given once to each new account made with Google while it&apos;s on.
          </DialogDescription>
        </div>

        <div className="-mx-1 min-h-0 flex-1 space-y-5 overflow-y-auto px-1 [scrollbar-width:thin]">
          <Field label="Name">
            <TextInput value={name} onChange={setName} maxLength={80} placeholder="e.g. Launch week" />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">Amount</span>
              <Segmented<Unit>
                options={["credits", "usd"]}
                value={unit}
                onChange={(u) => {
                  setUnit(u);
                  if (u === "usd") setUsdText(perCredit ? (usdValueCents / 100).toFixed(2) : "");
                }}
                label={(u) => (u === "usd" ? "USD" : "Credits")}
              />
            </div>
            {unit === "credits" ? (
              <input
                type="number"
                min={1}
                max={100000}
                value={credits}
                onChange={(e) => setCredits(Math.max(1, Math.min(100000, Math.round(Number(e.target.value) || 0))))}
                className="focus:border-primary/50 h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-base text-white focus:outline-none"
              />
            ) : (
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/50">$</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={usdText}
                  onChange={(e) => setFromUsd(e.target.value)}
                  disabled={!perCredit}
                  className="focus:border-primary/50 h-11 w-full rounded-xl border border-white/10 bg-black/40 pr-4 pl-8 text-base text-white focus:outline-none"
                />
              </div>
            )}
            <p className="text-xs text-white/50">
              <span className="font-semibold text-white">{int(credits)} credits</span>
              {perCredit > 0 ? (
                <>
                  {" "}
                  = <span className="font-semibold text-white">{usd(usdValueCents)}</span> per new user (at{" "}
                  {(perCredit / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 4 })}{" "}
                  a credit, the cheapest paid credit)
                </>
              ) : (
                " (no paid plan to price credits against)"
              )}
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">When</span>
            <Segmented<"always" | "range">
              options={["always", "range"]}
              value={always ? "always" : "range"}
              onChange={(v) => setAlways(v === "always")}
              label={(v) => (v === "always" ? "Always" : "Date range")}
            />
            {!always && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Starts" hint="Empty: from now">
                  <TextInput type="datetime-local" value={startsAt} onChange={setStartsAt} />
                </Field>
                <Field label="Ends" hint="Empty: no end">
                  <TextInput type="datetime-local" value={endsAt} onChange={setEndsAt} />
                </Field>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-white/75">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            On (only one gift can be on at the same time)
          </label>

          <div className="space-y-2">
            <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
              What {int(credits)} credits buys
            </span>
            {!quote ? (
              <p className="text-xs text-white/40">Loading prices…</p>
            ) : !affordable.length ? (
              <p className="text-xs text-white/40">Not enough for one generation of any model.</p>
            ) : (
              <div className="grid max-h-64 grid-cols-1 gap-1.5 overflow-y-auto sm:grid-cols-2 [scrollbar-width:thin]">
                {affordable.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2"
                  >
                    <span className="min-w-0 truncate text-[13px] text-white/80">{m.name}</span>
                    <span className="shrink-0 text-right text-[12px] text-white/55 tabular-nums">
                      <span className="font-semibold text-white">{int(Math.floor(credits / m.minCredits))}</span>
                      {m.unit === "one" ? "" : ` × ${m.unit}`} · {m.minCredits} cr
                    </span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-white/35">
              Each model at its cheapest setting (videos and audio: a {quote?.models.find((m) => m.unit !== "one")?.unit ?? "5 s"} clip).
              Models one gift can&apos;t buy once are hidden.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-white/10 px-5 text-sm font-semibold text-white/75 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={!valid || save.isPending}
            className="bg-primary hover:bg-primary/90 h-11 rounded-xl px-6 text-sm font-semibold text-white disabled:opacity-40"
          >
            {save.isPending ? "Saving…" : campaign ? "Save" : "Create gift"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
