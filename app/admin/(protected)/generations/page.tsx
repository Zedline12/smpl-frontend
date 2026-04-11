import { fetchWithToken } from "@/lib/fetcher";
import { GenerationsChart } from "./GenerationsChart";

export default async function GenerationsPage({
  searchParams,
}: {
  searchParams: Promise<{ time?: string; groupBy?: string }>; // updated to Promise for Next 15+ API
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const t = resolvedParams.time || "lastDay";
  const g = resolvedParams.groupBy || "model";

  let data = {};
  try {
    const res = await fetchWithToken(`/admin/generations/analytics?time=${t}&groupBy=${g}`);
    if (res.ok) {
        const json = await res.json();
        data = json.data;
    } else {
      console.error("Failed to fetch analytics", await res.text());
    }
  } catch (error) {
    console.error("Error fetching analytics", error);
  }

  // Next.js components can await promises. We format the JSON to match recharts input format:
    // [ { name: "modelA", total: 4 }, { name: "modelB", total: 1 } ]
    
  const chartData = Object.entries(data as Record<string, {totalGenerations: number}>).map(([key, value]) => ({
    name: key,
    total: Number(value.totalGenerations),
  }));
    console.log(chartData)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generation Analytics</h2>
          <p className="text-muted-foreground">
            View generation trends over time based on specific filters.
          </p>
        </div>
      </div>
      <GenerationsChart data={chartData} initialTime={t} initialGroupBy={g} />
    </div>
  );
}
