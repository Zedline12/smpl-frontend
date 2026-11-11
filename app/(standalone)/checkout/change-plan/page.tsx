import type { Metadata } from "next";
import { ChangePlanCheckoutPage } from "@/features/subscribe/components/ChangePlanCheckout";

export const metadata: Metadata = { title: "Change plan" };

export default async function ChangePlanPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  return <ChangePlanCheckoutPage planId={typeof plan === "string" ? plan : null} />;
}
