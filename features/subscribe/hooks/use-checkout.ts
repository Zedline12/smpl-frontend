import { useCallback, useState } from "react";

export function useCheckout() {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const startCheckout = useCallback(async (subscriptionPlanId: string) => {
    try {
      setLoadingPlanId(subscriptionPlanId);
      const response = await fetch("/api/billing/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscriptionPlanId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const result = await response.json();
      const { checkoutUrl } = result.data || result; // Handle potential wrapping

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Failed to start checkout:", error);
      // You might want to add toast notification here
    } finally {
      setLoadingPlanId(null);
    }
  }, []);

  return { startCheckout, loadingPlanId };
}
