"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, Link2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { humanize, money, shortDate } from "@/features/admin/users/types/billing";
import { adminJson, CouponDetail, pct } from "../types";
import { RedemptionOutcome } from "./RedemptionOutcome";
import { Field, fieldInput } from "./CreateCouponDialog";

const card = "rounded-xl border border-white/10 bg-background-light p-4";

function Tile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={card}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function CopyButton({ text, label, icon: Icon = Copy }: { text: string; label: string; icon?: typeof Copy }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
          .catch(() => toast.error("Couldn't copy"));
      }}
      className="flex size-7 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/5 hover:text-white"
    >
      {done ? <Check className="size-3.5 text-green-400" /> : <Icon className="size-3.5" />}
    </button>
  );
}

function AddCodeForm({ couponId, onAdded }: { couponId: string; onAdded: () => void }) {
  const [code, setCode] = useState("");
  const [source, setSource] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminJson(`/api/admin/coupons/${couponId}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          source: source.trim() || undefined,
          firstTimeOnly,
          ...(maxRedemptions ? { maxRedemptions: Number(maxRedemptions) } : {}),
          ...(expiresAt ? { expiresAt: new Date(`${expiresAt}T23:59:59`).toISOString() } : {}),
        }),
      });
      toast.success(`${code} created.`);
      setCode("");
      setSource("");
      setMaxRedemptions("");
      setExpiresAt("");
      setFirstTimeOnly(false);
      onAdded();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 grid gap-3 rounded-lg border border-white/10 p-3 sm:grid-cols-5">
      <Field label="Code">
        <input
          className={cn(fieldInput, "font-mono uppercase")}
          value={code}
          maxLength={40}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
          placeholder="INFLUENCER20"
        />
      </Field>
      <Field label="Source">
        <input className={fieldInput} value={source} maxLength={60} onChange={(e) => setSource(e.target.value)} placeholder="tiktok" />
      </Field>
      <Field label="Max uses">
        <input type="number" min={1} className={fieldInput} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} />
      </Field>
      <Field label="Expires">
        <input type="date" className={fieldInput} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
      </Field>
      <div className="flex flex-col justify-end gap-2">
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input type="checkbox" checked={firstTimeOnly} onChange={(e) => setFirstTimeOnly(e.target.checked)} />
          First-time only
        </label>
        <button
          type="button"
          onClick={save}
          disabled={saving || !/^[A-Z0-9_-]{3,40}$/.test(code)}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Add code
        </button>
      </div>
    </div>
  );
}

/** Admin: one coupon, its codes and every redemption with what happened after. */
export function CouponDetailClient({ couponId }: { couponId: string }) {
  const router = useRouter();
  const [data, setData] = useState<CouponDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("");
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    try {
      const d = await adminJson<CouponDetail>(`/api/admin/coupons/${couponId}`);
      setData(d);
      setName(d.coupon.name ?? "");
      setCampaign(d.coupon.campaign ?? "");
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [couponId]);

  useEffect(() => {
    void load();
    setOrigin(window.location.origin);
  }, [load]);

  const saveLabels = async () => {
    setBusy(true);
    try {
      await adminJson(`/api/admin/coupons/${couponId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), campaign: campaign.trim() }),
      });
      setEditing(false);
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleCode = async (codeId: string, active: boolean) => {
    try {
      await adminJson(`/api/admin/coupons/codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      });
      await load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this coupon in Stripe? Nobody can redeem it any more; discounts already running keep going.")) return;
    setBusy(true);
    try {
      await adminJson(`/api/admin/coupons/${couponId}`, { method: "DELETE" });
      toast.success("Coupon deleted.");
      router.push("/admin/discounts");
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!data) return <div className="h-64 animate-pulse rounded-xl bg-white/5" />;

  const { coupon, stats } = data;
  const maxMonth = Math.max(1, ...data.monthly.map((m) => m.redemptions));

  return (
    <div className="space-y-6">
      <Link href="/admin/discounts" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="size-4" /> Discounts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        {editing ? (
          <div className="grid w-full max-w-lg gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={fieldInput} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Campaign">
              <input className={fieldInput} value={campaign} maxLength={80} onChange={(e) => setCampaign(e.target.value)} />
            </Field>
            <div className="flex gap-2 sm:col-span-2">
              <button
                onClick={saveLabels}
                disabled={busy || !name.trim()}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              {coupon.name ?? coupon.providerCouponId}
              <button onClick={() => setEditing(true)} className="text-white/35 hover:text-white" aria-label="Edit name">
                <Pencil className="size-4" />
              </button>
            </h2>
            <p className="text-sm text-muted-foreground">
              {coupon.summary}
              {coupon.campaign ? ` · ${coupon.campaign}` : ""}
              {coupon.redeemBy ? ` · redeem by ${shortDate(coupon.redeemBy)}` : ""}
              {coupon.maxRedemptions ? ` · max ${coupon.maxRedemptions} uses` : ""}
              {coupon.appliesToProductIds.length ? " · limited to some plans" : ""}
            </p>
            {(coupon.deletedAt || !coupon.valid) && (
              <p className="mt-1 text-xs text-amber-300">
                {coupon.deletedAt ? `Deleted ${shortDate(coupon.deletedAt)}` : "No longer redeemable"}: running discounts keep going.
              </p>
            )}
          </div>
        )}
        {!coupon.deletedAt && !editing && (
          <button
            onClick={remove}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="size-3.5" /> Delete coupon
          </button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Redemptions" value={String(stats.redemptions)} hint={`${stats.newCustomers} brought in new customers`} />
        <Tile label="Discount running now" value={String(stats.activeNow)} hint={`${stats.discountedInvoices} discounted invoices so far`} />
        <Tile label="Discount given" value={money(stats.totalDiscounted)} hint={`Revenue from these subscriptions ${money(stats.revenue)}`} />
        <Tile
          label="Kept paying after the discount"
          value={stats.discountEnded ? pct(stats.postDiscountRetention) : "—"}
          hint={`${stats.canceledWhileDiscounted} canceled while on it · ${stats.canceledWithinWindow} soon after`}
        />
      </div>

      <section className={card}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Codes</p>
          {!coupon.deletedAt && coupon.valid && (
            <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white">
              <Plus className="size-3.5" /> Add code
            </button>
          )}
        </div>
        {data.codes.length === 0 ? (
          <p className="text-sm text-white/40">No codes yet. Without a code, this coupon can only be applied from Stripe.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs text-white/40">
                  <th className="pb-2 font-medium">Code</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 text-right font-medium">Used</th>
                  <th className="pb-2 text-right font-medium">New customers</th>
                  <th className="pb-2 text-right font-medium">Given</th>
                  <th className="pb-2 font-medium">Rules</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data.codes.map((code) => (
                  <tr key={code.id}>
                    <td className="py-2 font-mono font-semibold">{code.code}</td>
                    <td className="py-2 text-white/60">{code.source ?? "—"}</td>
                    <td className="py-2 text-right tabular-nums">
                      {code.stats.redemptions}
                      {code.maxRedemptions ? <span className="text-white/35"> / {code.maxRedemptions}</span> : null}
                    </td>
                    <td className="py-2 text-right tabular-nums">{code.stats.newCustomers}</td>
                    <td className="py-2 text-right tabular-nums">{money(code.stats.totalDiscounted)}</td>
                    <td className="py-2 text-xs text-white/50">
                      {[code.firstTimeOnly && "first-time only", code.expiresAt && `expires ${shortDate(code.expiresAt)}`]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => toggleCode(code.id, !code.active)}
                        disabled={!!coupon.deletedAt}
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs",
                          code.active
                            ? "border-green-500/30 bg-green-500/10 text-green-300 hover:bg-green-500/20"
                            : "border-white/10 text-white/45 hover:bg-white/5",
                        )}
                        title={code.active ? "Turn off" : "Turn on"}
                      >
                        {code.active ? "Active" : "Off"}
                      </button>
                    </td>
                    <td className="py-2">
                      <div className="flex justify-end gap-0.5">
                        <CopyButton text={code.code} label="Copy code" />
                        <CopyButton text={`${origin}/pricing?code=${encodeURIComponent(code.code)}`} label="Copy share link" icon={Link2} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {adding && <AddCodeForm couponId={couponId} onAdded={() => { setAdding(false); void load(); }} />}
      </section>

      <section className={cn(card, "overflow-x-auto")}>
        <p className="mb-3 text-sm font-semibold">Who used it ({data.redemptions.length})</p>
        {data.redemptions.length === 0 ? (
          <p className="text-sm text-white/40">Nobody yet.</p>
        ) : (
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="text-left text-xs text-white/40">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Code</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium">Redeemed</th>
                <th className="pb-2 font-medium">Discounted until</th>
                <th className="pb-2 text-right font-medium">Invoices</th>
                <th className="pb-2 text-right font-medium">Saved</th>
                <th className="pb-2 text-right font-medium">Paid</th>
                <th className="pb-2 pl-4 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {data.redemptions.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="py-2">
                    <Link href={`/admin/users/${r.userId}`} className="hover:underline">
                      {r.email ?? r.userId}
                    </Link>
                    <div className="text-[11px] text-white/40">
                      {humanize(r.appliedVia)}
                      {r.isNewCustomer ? " · new customer" : " · existing customer"}
                    </div>
                  </td>
                  <td className="py-2 font-mono text-xs">{r.code ?? "—"}</td>
                  <td className="py-2 text-white/70">{r.planName ?? "—"}</td>
                  <td className="py-2 text-white/70">{shortDate(r.start)}</td>
                  <td className="py-2 text-white/70">
                    {r.activeNow ? (r.scheduledEnd ? shortDate(r.scheduledEnd) : "No end") : shortDate(r.benefitEnd ?? r.endedAt)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{r.discountedInvoiceCount}</td>
                  <td className="py-2 text-right tabular-nums">{money(r.totalDiscounted)}</td>
                  <td className="py-2 text-right tabular-nums">{money(r.revenue)}</td>
                  <td className="py-2 pl-4">
                    <RedemptionOutcome redemption={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {data.monthly.length > 0 && (
        <section className={card}>
          <p className="mb-3 text-sm font-semibold">Redemptions per month</p>
          <div className="space-y-1.5">
            {data.monthly.map((m) => (
              <div key={m.month} className="flex items-center gap-3 text-xs">
                <span className="w-16 shrink-0 text-white/50 tabular-nums">{m.month}</span>
                <div className="h-3 flex-1">
                  <div
                    className="h-full rounded-r-[4px] bg-[#3987e5]"
                    style={{ width: `${(m.redemptions / maxMonth) * 100}%`, maxWidth: "100%" }}
                    title={`${m.redemptions} redemptions, ${m.newCustomers} new customers`}
                  />
                </div>
                <span className="w-28 shrink-0 text-right tabular-nums text-white/70">
                  {m.redemptions} · {m.newCustomers} new
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
