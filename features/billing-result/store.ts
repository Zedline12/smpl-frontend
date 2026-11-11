import { create } from "zustand";

type Money = { amountPaid: number; currency: string };

/** What the billing popup shows. Amounts are in cents. */
export type BillingResult =
  | { variant: "confirming" }
  | ({ variant: "subscribed" | "upgraded"; planName: string; credits: number; balance: number | null } & Money)
  | { variant: "downgraded"; planName: string; nextBillingDate: string | null }
  | ({ variant: "pack"; packName: string; credits: number; balance: number | null } & Money)
  | { variant: "processing"; kind: "subscription" | "credit_pack" }
  | { variant: "canceled"; kind: "subscription" | "credit_pack" }
  | {
      variant: "failed";
      title: string;
      message: string;
      /** Show "Update payment method" (card problems). */
      paymentMethod?: boolean;
      /** Where "Try again" goes, if anywhere. */
      retryHref?: string;
    };

interface BillingResultState {
  result: BillingResult | null;
  open: (result: BillingResult) => void;
  close: () => void;
}

export const useBillingResult = create<BillingResultState>((set) => ({
  result: null,
  open: (result) => set({ result }),
  close: () => set({ result: null }),
}));
