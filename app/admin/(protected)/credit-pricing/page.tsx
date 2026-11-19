import { Suspense } from "react";
import { PricingStudio } from "@/features/admin/pricing/PricingStudio";

/** Pricing: costs, credit prices and what every plan earns on each model. */
export default function CreditPricingPage() {
  return (
    <div className="p-6">
      <Suspense>
        <PricingStudio />
      </Suspense>
    </div>
  );
}
