"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowDownRight, Check, Clock, Loader2, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BillingResult, useBillingResult } from "./store";

const money = (cents: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
};
const num = (n: number) => n.toLocaleString("en-US");
const date = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "your next bill";

type Tone = "success" | "neutral" | "danger";

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto flex size-16 items-center justify-center rounded-full",
        tone === "success" && "bg-primary/15 text-primary shadow-[0_0_48px_-6px_var(--color-primary)]",
        tone === "neutral" && "bg-white/[0.06] text-white/70",
        tone === "danger" && "bg-red-500/15 text-red-400 shadow-[0_0_40px_-8px_rgb(239_68_68)]",
      )}
    >
      {children}
    </div>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="text-white/50">{label}</dt>
          <dd className="font-medium text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function CreditsHero({ credits, label }: { credits: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-primary text-[44px] leading-none font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        +{num(credits)}
      </p>
      <p className="mt-1.5 text-sm text-white/60">{label}</p>
    </div>
  );
}

const primaryBtn =
  "bg-primary flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60";
const ghostBtn =
  "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06]";

function UpdatePaymentButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const open = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/billing-portal", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) throw new Error(json?.message ?? "Could not open billing");
      window.location.href = json.url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };
  return (
    <>
      <button type="button" onClick={open} disabled={loading} className={primaryBtn}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Update payment method
      </button>
      {error && <p className="w-full text-center text-xs text-red-400">{error}</p>}
    </>
  );
}

function Body({ result, close }: { result: BillingResult; close: () => void }) {
  switch (result.variant) {
    case "confirming":
      return (
        <>
          <Badge tone="neutral">
            <Loader2 className="size-7 animate-spin" />
          </Badge>
          <Header title="Confirming your payment…" text="This only takes a moment." />
        </>
      );

    case "subscribed":
    case "upgraded":
      return (
        <>
          <Badge tone="success">
            <Check className="size-8" strokeWidth={2.5} />
          </Badge>
          <Header
            title={`You're on ${result.planName}!`}
            text={result.variant === "upgraded" ? "Your upgrade is active right away." : "Your subscription is active. Welcome aboard."}
          />
          {result.credits > 0 && <CreditsHero credits={result.credits} label="credits added to your account" />}
          <Rows
            rows={[
              ["Plan", result.planName],
              ["Paid", money(result.amountPaid, result.currency)],
              ...(result.balance != null ? ([["Credit balance", num(result.balance)]] as [string, string][]) : []),
            ]}
          />
          <div className="flex gap-2">
            <Link href="/create" onClick={close} className={primaryBtn}>
              <Sparkles className="size-4" />
              Start creating
            </Link>
          </div>
        </>
      );

    case "downgraded":
      return (
        <>
          <Badge tone="success">
            <ArrowDownRight className="size-8" />
          </Badge>
          <Header
            title={`Switched to ${result.planName}`}
            text={`Your new price starts on ${date(result.nextBillingDate)}. You keep your current plan and credits until then.`}
          />
          <div className="flex gap-2">
            <button type="button" onClick={close} className={primaryBtn}>
              Got it
            </button>
          </div>
        </>
      );

    case "pack":
      return (
        <>
          <Badge tone="success">
            <Check className="size-8" strokeWidth={2.5} />
          </Badge>
          <Header title="Payment successful" text={`Your ${result.packName} credits are ready to use.`} />
          <CreditsHero credits={result.credits} label={`credits from ${result.packName}`} />
          <Rows
            rows={[
              ["Pack", result.packName],
              ["Paid", money(result.amountPaid, result.currency)],
              ...(result.balance != null ? ([["Credit balance", num(result.balance)]] as [string, string][]) : []),
            ]}
          />
          <div className="flex gap-2">
            <Link href="/create" onClick={close} className={primaryBtn}>
              <Sparkles className="size-4" />
              Start creating
            </Link>
          </div>
        </>
      );

    case "processing":
      return (
        <>
          <Badge tone="neutral">
            <Clock className="size-7" />
          </Badge>
          <Header
            title="Payment processing"
            text={
              result.kind === "credit_pack"
                ? "Your bank is still confirming the payment. We'll add your credits as soon as it clears."
                : "Your bank is still confirming the payment. Your plan and credits start as soon as it clears."
            }
          />
          <div className="flex gap-2">
            <button type="button" onClick={close} className={primaryBtn}>
              Got it
            </button>
          </div>
        </>
      );

    case "canceled":
      return (
        <>
          <Badge tone="neutral">
            <X className="size-7" />
          </Badge>
          <Header title="Checkout canceled" text="No payment was made. You can try again whenever you're ready." />
          <div className="flex gap-2">
            <button type="button" onClick={close} className={ghostBtn}>
              Close
            </button>
            <Link
              href={result.kind === "credit_pack" ? "/me/settings/subscription" : "/pricing"}
              onClick={close}
              className={primaryBtn}
            >
              {result.kind === "credit_pack" ? "View credit packs" : "View plans"}
            </Link>
          </div>
        </>
      );

    case "failed":
      return (
        <>
          <Badge tone="danger">
            <AlertTriangle className="size-7" />
          </Badge>
          <Header title={result.title} text={result.message} />
          <div className="flex flex-wrap gap-2">
            {result.paymentMethod ? (
              <UpdatePaymentButton />
            ) : result.retryHref ? (
              <Link href={result.retryHref} onClick={close} className={primaryBtn}>
                Try again
              </Link>
            ) : null}
            <button type="button" onClick={close} className={ghostBtn}>
              Close
            </button>
          </div>
        </>
      );
  }
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <div className="text-center">
      <DialogTitle className="text-xl font-bold text-white">{title}</DialogTitle>
      <DialogDescription className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-white/55">{text}</DialogDescription>
    </div>
  );
}

/** The one popup for billing outcomes: subscribed, upgraded, credit packs, failures. */
export function BillingResultModal() {
  const result = useBillingResult((s) => s.result);
  const close = useBillingResult((s) => s.close);
  const busy = result?.variant === "confirming";

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && !busy && close()}>
      <DialogContent
        className="border-white/[0.08] bg-[#0c0c0f] z-[100] flex max-w-[400px] flex-col gap-5 rounded-3xl border p-7 sm:rounded-3xl"
        onInteractOutside={(e) => busy && e.preventDefault()}
      >
        {result && <Body result={result} close={close} />}
      </DialogContent>
    </Dialog>
  );
}
