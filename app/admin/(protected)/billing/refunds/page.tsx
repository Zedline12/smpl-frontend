import { Suspense } from "react";
import { RefundsDashboard } from "@/features/admin/billing-records/RefundsDashboard";

/** Admin → Billing → Refunds: every refund with who, why, the money and what else happened. */
export default function RefundsPage() {
  return (
    <div className="p-6">
      <Suspense>
        <RefundsDashboard />
      </Suspense>
    </div>
  );
}
