import { useCallback, useEffect, useState } from "react";
import type { CheckoutPromotion } from "./use-checkout";

export interface PromotionPlanPrice {
  planId: string;
  planName: string;
  eligible: boolean;
  reason: string | null;
  /** Cents. */
  regularPrice: number;
  firstPayment: number;
  currency: string;
}

export interface AppliedPromotion {
  code: string;
  summary: string;
  duration: "once" | "repeating" | "forever";
  durationInMonths: number | null;
  plans: PromotionPlanPrice[];
  appliedVia: CheckoutPromotion["appliedVia"];
}

const STORAGE_KEY = "smpl:promo-code";

type Stored = { code: string; appliedVia: CheckoutPromotion["appliedVia"] };

function readStored(): Stored | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(value: Stored | null) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked: the code just won't survive a reload */
  }
}

/**
 * The promotion code on the pricing page: typed in the code box or opened from a share
 * link (`/pricing?code=SUMMER25`). A share-link code is remembered for the tab, so it
 * survives logging in.
 */
export function usePromotionCode(canApply: boolean) {
  const [promotion, setPromotion] = useState<AppliedPromotion | null>(null);
  const [pending, setPending] = useState<Stored | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const apply = useCallback(async (rawCode: string, appliedVia: CheckoutPromotion["appliedVia"]) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return false;
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/promotion-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Couldn't check this code.");
      if (!json?.valid) throw new Error(json?.message || "This code can't be used.");
      setPromotion({
        code: json.code,
        summary: json.summary,
        duration: json.duration,
        durationInMonths: json.durationInMonths ?? null,
        plans: json.plans ?? [],
        appliedVia,
      });
      writeStored({ code: json.code, appliedVia });
      setPending(null);
      return true;
    } catch (e) {
      setPromotion(null);
      setError((e as Error).message);
      writeStored(null);
      setPending(null);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPromotion(null);
    setError(null);
    setPending(null);
    writeStored(null);
  }, []);

  // A share link (?code=) or a code remembered from before logging in.
  useEffect(() => {
    let fromUrl: string | null = null;
    try {
      fromUrl = new URLSearchParams(window.location.search).get("code");
    } catch {
      fromUrl = null;
    }
    const next: Stored | null = fromUrl
      ? { code: fromUrl.trim().toUpperCase().slice(0, 64), appliedVia: "share_link" }
      : readStored();
    if (!next?.code) return;
    writeStored(next);
    setPending(next);
  }, []);

  useEffect(() => {
    if (pending && canApply && !promotion && !isChecking) void apply(pending.code, pending.appliedVia);
  }, [pending, canApply, promotion, isChecking, apply]);

  return { promotion, pendingCode: pending?.code ?? null, error, isChecking, apply, clear };
}
