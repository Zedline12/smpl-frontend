import { redirect } from "next/navigation";

/** Costs are edited on the Pricing page now, next to each model's margin. */
export default function ModelCostsPage() {
  redirect("/admin/credit-pricing");
}
