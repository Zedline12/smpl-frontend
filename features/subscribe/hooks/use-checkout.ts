import { useCallback, useState } from "react";
import { toast } from "sonner";

/** A promotion code applied on the pricing page. */
export interface CheckoutPromotion {
  code: string;
  appliedVia: "code_box" | "share_link";
}

/** Thrown when the code ran out between applying it and paying. */
export class PromotionCodeError extends Error {}

/** Starts a Stripe checkout for a new subscription (users without a paid plan). */
export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = useCallback(
    async (subscriptionPlanId: string, captchaToken: string, promotion?: CheckoutPromotion | null) => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/billing/checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionPlanId,
            captchaToken,
            ...(promotion ? { promotionCode: promotion.code, appliedVia: promotion.appliedVia } : {}),
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            result?.message ||
            (typeof result?.error === "string" ? result.error : null) ||
            "Couldn't start checkout. Please try again.";
          // The backend puts error codes under `error.code`.
          const code = result?.error?.code ?? result?.code;
          if (code === "INVALID_PROMOTION_CODE") throw new PromotionCodeError(message);
          throw new Error(message);
        }
        const { checkoutUrl } = result?.data || result || {};
        if (checkoutUrl) window.location.href = checkoutUrl;
        return true;
      } catch (error) {
        console.error("Failed to start checkout:", error);
        toast.error((error as Error).message);
        if (error instanceof PromotionCodeError) return "invalid_code" as const;
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { startCheckout, isLoading };
}

/** Moves an existing paid subscription to another plan (no new checkout). */
export function useChangePlan() {
  const [isLoading, setIsLoading] = useState(false);

  const changePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user-subscriptions/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Couldn't change your plan.");
      toast.success(
        result?.changed === "upgraded"
          ? "Plan upgraded. Your extra credits are on the way."
          : "Plan changed. The new price applies from your next bill.",
      );
      return true;
    } catch (error) {
      toast.error((error as Error).message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { changePlan, isLoading };
}
