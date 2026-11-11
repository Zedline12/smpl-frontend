"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";
import { adminJson, CouponDuration } from "../types";

export const fieldInput =
  "w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none [color-scheme:dark]";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/70">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </label>
  );
}

const DURATIONS: { value: CouponDuration; label: string; hint: string }[] = [
  { value: "once", label: "First payment", hint: "Only the first invoice" },
  { value: "repeating", label: "Several months", hint: "Every invoice for N months" },
  { value: "forever", label: "Forever", hint: "Every invoice" },
];

const CODE_PATTERN = /^[A-Z0-9_-]{3,40}$/;

/** New coupon (created in Stripe) with its first code. */
export function CreateCouponDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [name, setName] = useState("");
  const [campaign, setCampaign] = useState("");
  const [kind, setKind] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [duration, setDuration] = useState<CouponDuration>("repeating");
  const [months, setMonths] = useState("3");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [redeemBy, setRedeemBy] = useState("");
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [source, setSource] = useState("");
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/subscription-plans")
      .then((r) => r.json())
      .then((json) => setPlans((Array.isArray(json?.data) ? json.data : []).filter((p: SubscriptionPlan) => p.priceAmount > 0)))
      .catch(() => setPlans([]));
  }, [open]);

  const number = Number(value);
  const valid =
    name.trim() &&
    number > 0 &&
    (kind === "amount" || number <= 100) &&
    (duration !== "repeating" || Number(months) >= 1) &&
    (!code || CODE_PATTERN.test(code));

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await adminJson("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          campaign: campaign.trim() || undefined,
          ...(kind === "percent" ? { percentOff: number } : { amountOff: Math.round(number * 100), currency: "usd" }),
          duration,
          ...(duration === "repeating" ? { durationInMonths: Number(months) } : {}),
          ...(maxRedemptions ? { maxRedemptions: Number(maxRedemptions) } : {}),
          ...(redeemBy ? { redeemBy: new Date(`${redeemBy}T23:59:59`).toISOString() } : {}),
          ...(planIds.length ? { planIds } : {}),
          ...(code
            ? { code: { code, source: source.trim() || undefined, firstTimeOnly } }
            : {}),
        }),
      });
      toast.success(code ? `Coupon created. ${code} is ready to share.` : "Coupon created.");
      onCreated();
      onOpenChange(false);
      setName("");
      setCampaign("");
      setValue("");
      setCode("");
      setSource("");
      setPlanIds([]);
      setMaxRedemptions("");
      setRedeemBy("");
      setFirstTimeOnly(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-white/10 bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle>New coupon</DialogTitle>
          <DialogDescription>
            Created in Stripe. Only the name and campaign can change later; the discount itself is fixed.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" hint="Shown on invoices and in Stripe">
            <input className={fieldInput} value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Summer sale" />
          </Field>
          <Field label="Campaign (optional)" hint="For grouping in analytics">
            <input className={fieldInput} value={campaign} maxLength={80} onChange={(e) => setCampaign(e.target.value)} placeholder="Summer 2026" />
          </Field>

          <Field label="Discount">
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={kind === "percent" ? 1 : 0.01}
                className={fieldInput}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={kind === "percent" ? "25" : "5.00"}
              />
              <select className={cn(fieldInput, "w-20")} value={kind} onChange={(e) => setKind(e.target.value as "percent" | "amount")}>
                <option value="percent">%</option>
                <option value="amount">$</option>
              </select>
            </div>
          </Field>
          <Field label="Max uses (optional)" hint="Across all codes of this coupon">
            <input type="number" min={1} className={fieldInput} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} />
          </Field>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium text-white/70">Applies to</span>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value)}
                className={cn(
                  "rounded-lg border p-2.5 text-left transition-colors",
                  duration === d.value ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/20",
                )}
              >
                <p className="text-sm font-medium">{d.label}</p>
                <p className="text-[11px] text-white/45">{d.hint}</p>
              </button>
            ))}
          </div>
          {duration === "repeating" && (
            <div className="w-40">
              <Field label="Months">
                <input type="number" min={1} max={36} className={fieldInput} value={months} onChange={(e) => setMonths(e.target.value)} />
              </Field>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Last day to redeem (optional)">
            <input type="date" className={fieldInput} value={redeemBy} onChange={(e) => setRedeemBy(e.target.value)} />
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-white/70">Plans (none selected = all)</span>
            <div className="flex flex-wrap gap-1.5">
              {plans.map((p) => {
                const on = planIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanIds((ids) => (on ? ids.filter((i) => i !== p.id) : [...ids, p.id]))}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs",
                      on ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-white/55 hover:text-white",
                    )}
                  >
                    {p.name} · {p.billingPeriod === "YEARLY" ? "yearly" : "monthly"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 p-3">
          <p className="mb-3 text-xs font-medium text-white/70">First code (optional, you can add more later)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" hint="3–40 letters, digits, - or _">
              <input
                className={cn(fieldInput, "font-mono uppercase")}
                value={code}
                maxLength={40}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                placeholder="SUMMER25"
              />
            </Field>
            <Field label="Source (optional)" hint="Where you share it: instagram, newsletter…">
              <input className={fieldInput} value={source} maxLength={60} onChange={(e) => setSource(e.target.value)} />
            </Field>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-white/70">
            <input type="checkbox" checked={firstTimeOnly} onChange={(e) => setFirstTimeOnly(e.target.checked)} />
            First-time customers only
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Create coupon
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
