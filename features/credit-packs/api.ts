import { CreditPack, CreditPackInput } from "@/lib/types/credit-pack.type";

async function readJson<T>(res: Response, fallback: string): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || json?.message || fallback);
  return (json?.data ?? json) as T;
}

/** Buyable packs. */
export async function fetchCreditPacks(): Promise<CreditPack[]> {
  return readJson<CreditPack[]>(await fetch("/api/credit-packs"), "Could not load credit packs");
}

/** Starts a Stripe checkout for a pack and returns its URL. */
export async function startCreditPackCheckout(creditPackId: string, captchaToken: string): Promise<string> {
  const res = await fetch("/api/payments/credit-pack-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creditPackId, captchaToken }),
  });
  const { checkoutUrl } = await readJson<{ checkoutUrl?: string }>(res, "Couldn't start checkout");
  if (!checkoutUrl) throw new Error("Couldn't start checkout");
  return checkoutUrl;
}

// ---- Admin ----

export async function fetchAllCreditPacks(): Promise<CreditPack[]> {
  return readJson<CreditPack[]>(await fetch("/api/admin/credit-packs"), "Could not load credit packs");
}

export async function createCreditPack(data: CreditPackInput): Promise<CreditPack> {
  const res = await fetch("/api/admin/credit-packs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJson<CreditPack>(res, "Could not create the pack");
}

export async function updateCreditPack(id: string, data: Partial<CreditPackInput>): Promise<CreditPack> {
  const res = await fetch(`/api/admin/credit-packs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return readJson<CreditPack>(res, "Could not save the pack");
}

export async function deleteCreditPack(id: string): Promise<void> {
  const res = await fetch(`/api/admin/credit-packs/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) await readJson(res, "Could not delete the pack");
}
