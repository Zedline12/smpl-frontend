import type { ComponentProps } from "react";
import { fetchWithToken } from "@/lib/fetcher";
import { ProfitDashboard } from "@/features/admin/profit/components/ProfitDashboard";

export default async function ProfitPage() {
  let months: ComponentProps<typeof ProfitDashboard>["months"] = {};

  try {
    const res = await fetchWithToken("/admin/analytics/profit");
    if (res.ok) {
      const json = await res.json();
      months = json.data?.months ?? json.months ?? {};
    }
  } catch (error) {
    console.error("Error fetching profit data:", error);
  }

  return (
    <div className="space-y-8 sm:p-2">
      <ProfitDashboard months={months} />
    </div>
  );
}
