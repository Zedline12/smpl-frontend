import { Suspense } from "react";
import { DisputesDashboard } from "@/features/admin/billing-records/DisputesDashboard";

/** Admin → Billing → Disputes: chargebacks, deadlines, outcomes and evidence. */
export default function DisputesPage() {
  return (
    <div className="p-6">
      <Suspense>
        <DisputesDashboard />
      </Suspense>
    </div>
  );
}
