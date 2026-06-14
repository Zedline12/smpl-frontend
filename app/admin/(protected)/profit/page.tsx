import { fetchWithToken } from "@/lib/fetcher";
import { ProfitDashboard } from "@/features/admin/profit/components/ProfitDashboard";

export default async function ProfitPage() {
  let months: Record<string, any> = {};

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
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Profit Analytics</h2>
        <p className="text-gray-400">Monthly revenue, costs, and per-model breakdown.</p>
      </div>
      <ProfitDashboard months={months} />
    </div>
  );
}
