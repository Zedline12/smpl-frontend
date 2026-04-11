"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  total: {
    label: "Total Generations",
    color: "purple",
  },
} satisfies ChartConfig;

export function GenerationsChart({
  data,
  initialTime,
  initialGroupBy,
}: {
  data: any[];
  initialTime: string;
  initialGroupBy: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleParamChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Card className="bg-neutral-900 text-primary-foreground">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Generation Analytics</CardTitle>
          <CardDescription>
            {initialTime === "lastDay"
              ? "Last 24 Hours"
              : initialTime === "lastWeek"
                ? "Last 7 Days"
                : "Last 30 Days"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 text-primary-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={initialTime}
            onChange={(e) => handleParamChange("time", e.target.value)}
          >
            <option value="lastDay">Last Day</option>
            <option value="lastWeek">Last Week</option>
            <option value="lastMonth">Last Month</option>
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 text-primary-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={initialGroupBy}
            onChange={(e) => handleParamChange("groupBy", e.target.value)}
          >
            <option value="model">By Model</option>
            <option value="type">By Type</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] ">
            No data available for this timeframe.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 20, left: 12, right: 12, bottom: 20 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-muted"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(val) => val.toString()}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => Math.floor(val).toString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel={false} />}
              />
              <Bar
                dataKey="total"
                fill="var(--color-total)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
