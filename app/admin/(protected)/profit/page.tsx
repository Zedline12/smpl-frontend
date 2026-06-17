import { fetchWithToken } from "@/lib/fetcher";
import { ProfitDashboard } from "@/features/admin/profit/components/ProfitDashboard";

export default async function ProfitPage() {
  let months: Record<string, any> = {};

  try {
    const res = await fetchWithToken("/admin/analytics/profit");
    if (res.ok) {
      const json = await res.json();
      console.log(json)
      months = json.data?.months ?? json.months ?? {};
    }
  } catch (error) {
    console.error("Error fetching profit data:", error);
  }

  return (
    <div className="space-y-8 p-6">
      <ProfitDashboard months={months} />
    </div>
  );
}
