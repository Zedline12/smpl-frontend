/** A one-time credit top-up (GET /credit-packs). */
export interface CreditPack {
  id: string;
  name: string;
  description: string;
  credits: number;
  /** Display price, e.g. 24.99. */
  priceAmount: number;
  currency: string;
  stripePriceId: string;
  active: boolean;
  isMostPopular: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreditPackInput = Omit<CreditPack, "id" | "createdAt" | "updatedAt">;

export const formatPackPrice = (p: Pick<CreditPack, "priceAmount" | "currency">) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: (p.currency || "usd").toUpperCase() }).format(
    p.priceAmount,
  );
