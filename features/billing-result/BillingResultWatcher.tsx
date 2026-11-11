"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { BillingResultModal } from "./BillingResultModal";
import { useBillingResult } from "./store";

type Kind = "subscription" | "credit_pack";

interface CheckoutResult {
  kind: Kind;
  status: "success" | "processing" | "failed";
  planName: string | null;
  packName: string | null;
  credits: number;
  amountPaid: number;
  currency: string;
  balance: number | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchResult(sessionId: string): Promise<CheckoutResult | null> {
  const res = await fetch(`/api/billing/checkout-result/${encodeURIComponent(sessionId)}`);
  const json = await res.json().catch(() => null);
  if (!res.ok) return null;
  return (json?.data ?? json) as CheckoutResult;
}

/**
 * Back from Stripe Checkout (`?billing=success&session_id=…` or `?billing=canceled`):
 * asks the backend what happened (it also finishes the purchase if the webhook is late)
 * and opens the billing popup.
 */
function Watcher() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const open = useBillingResult((s) => s.open);
  const handled = useRef<string | null>(null);

  const billing = params.get("billing");
  const sessionId = params.get("session_id");
  const kind: Kind = params.get("kind") === "credit_pack" ? "credit_pack" : "subscription";

  useEffect(() => {
    if (!billing) return;
    const key = `${billing}:${sessionId ?? ""}`;
    if (handled.current === key) return;
    handled.current = key;

    // Drop our params so a reload doesn't show the popup again.
    const rest = new URLSearchParams(params.toString());
    for (const name of ["billing", "session_id", "kind"]) rest.delete(name);
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });

    if (billing === "canceled") {
      open({ variant: "canceled", kind });
      return;
    }
    if (billing !== "success" || !sessionId) return;

    open({ variant: "confirming" });
    void (async () => {
      let result: CheckoutResult | null = null;
      // A bank may take a few seconds to confirm: check again for ~20s.
      for (let attempt = 0; attempt < 7; attempt++) {
        result = await fetchResult(sessionId).catch(() => null);
        if (result && result.status !== "processing") break;
        await sleep(3000);
      }
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.refresh();

      if (!result) {
        open({
          variant: "failed",
          title: "We couldn't confirm your payment",
          message: "If you were charged, your plan and credits will appear in a few minutes. Contact support if they don't.",
        });
      } else if (result.status === "processing") {
        open({ variant: "processing", kind: result.kind });
      } else if (result.status === "failed") {
        open({
          variant: "failed",
          title: "Payment didn't go through",
          message: "The checkout expired before the payment finished. No charge was made.",
          retryHref: result.kind === "credit_pack" ? "/me/settings/subscription" : "/pricing",
        });
      } else if (result.kind === "credit_pack") {
        open({
          variant: "pack",
          packName: result.packName ?? "credit pack",
          credits: result.credits,
          amountPaid: result.amountPaid,
          currency: result.currency,
          balance: result.balance,
        });
      } else {
        open({
          variant: "subscribed",
          planName: result.planName ?? "your new plan",
          credits: result.credits,
          amountPaid: result.amountPaid,
          currency: result.currency,
          balance: result.balance,
        });
      }
    })();
  }, [billing, sessionId, kind, params, pathname, router, queryClient, open]);

  return null;
}

/** Mounted once at the root: the watcher plus the popup it opens. */
export function BillingResultWatcher() {
  return (
    <>
      <Suspense fallback={null}>
        <Watcher />
      </Suspense>
      <BillingResultModal />
    </>
  );
}
