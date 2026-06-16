"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface ModelGeneration {
  totalGenerations: number;
  totalCost: number;
}

interface MonthData {
  grossVolume: number;
  netVolume: number;
  netProfit: number;
  totalGenerationsCost: number;
  totalGenerations: number;
  disputes: number;
  refunds: number;
  stripeFees: number;
  transfers: number;
  generations: Record<string, ModelGeneration>;
}

interface ProfitDashboardProps {
  months: Record<string, MonthData>;
}

const chartConfig = {
  totalGenerations: {
    label: "Generations",
    color: "#6b41ff",
  },
  totalCost: {
    label: "Cost ($)",
    color: "#ff6b00",
  },
} satisfies ChartConfig;

export function ProfitDashboard({ months }: ProfitDashboardProps) {
  const monthKeys = Object.keys(months);
  const [selected, setSelected] = useState(monthKeys[0] ?? "");

  const data = months[selected];

  const chartData = data
    ? Object.entries(data.generations).map(([model, v]) => ({
        model,
        totalGenerations: v.totalGenerations,
        totalCost: v.totalCost,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-neutral-400">Month</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="h-10 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {monthKeys.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {data ? (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Gross Volume */}
            <Card className="bg-emerald-500/10 border-emerald-500/20 text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-400">Gross Volume</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-emerald-400">
                  <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                  <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
                  <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${data.grossVolume}</div>
              </CardContent>
            </Card>

            {/* Net Volume */}
            <Card className="bg-teal-500/10 border-teal-500/20 text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-teal-400">Net Volume</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-teal-400">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${data.netVolume}</div>
              </CardContent>
            </Card>
                {/* Generations Cost */}
            <Card className="bg-orange-500/10 border-orange-500/20 text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-400">Generations Cost</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-orange-400">
                  <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${data.totalGenerationsCost}</div>
              </CardContent>
            </Card>
            {/* Net Profit */}
            <Card className="bg-violet-500/10 border-violet-500/20 text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-400">Net Profit</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-violet-400">
                  <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a17.252 17.252 0 0 0-3.305 2.084c-1.311 1.026-2.397 2.14-3.791 2.948-1.26.733-2.641 1.148-4.196 1.148a.75.75 0 0 1 0-1.5c1.243 0 2.359-.322 3.427-.933 1.232-.716 2.199-1.706 3.468-2.7a18.768 18.768 0 0 1 3.598-2.267l1.084-.484-4.25-1.631a.75.75 0 0 1-.432-.97Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M1.72 6.268a.75.75 0 0 0-.97.431L.47 12.64a.75.75 0 1 0 1.4.537l1.63-4.251 1.086.484a17.25 17.25 0 0 1 3.305 2.084c1.311 1.026 2.396 2.14 3.79 2.948 1.26.733 2.642 1.148 4.197 1.148a.75.75 0 0 0 0-1.5c-1.243 0-2.36-.322-3.427-.933-1.232-.716-2.2-1.706-3.469-2.7A18.768 18.768 0 0 0 5.38 8.19l-1.084-.484 4.25-1.631a.75.75 0 0 0 .432-.97L8.72 6.27l-7 .001Z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">${data.netProfit}</div>
              </CardContent>
            </Card>

           

            {/* Total Generations
            <Card className="bg-blue-500/10 border-blue-500/20 text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">Total Generations</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
                  <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{data.totalGenerations?.toLocaleString()}</div>
              </CardContent>
            </Card> */}

          </div>

          {/* Secondary cards — Stripe breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Stripe Fees", value: `$${data.stripeFees}` },
              { label: "Transfers",   value: `$${data.transfers}` },
              { label: "Refunds",     value: `$${data.refunds}` },
              { label: "Disputes",    value: `$${data.disputes}` },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3"
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                  {label}
                </span>
                <span className="text-base font-semibold text-neutral-200">{value}</span>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <Card className="bg-neutral-900 border-neutral-800 text-primary-foreground">
            <CardHeader>
              <CardTitle>Model Breakdown</CardTitle>
              <CardDescription>
                Generations and cost per model for {selected}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ top: 20, left: 12, right: 12, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="model"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="totalGenerations"
                      fill="var(--color-totalGenerations)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="totalCost"
                      fill="var(--color-totalCost)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-neutral-500 text-sm py-10 text-center">
                  No generation data for {selected}.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-neutral-500">No data available.</p>
      )}
    </div>
  );
}
