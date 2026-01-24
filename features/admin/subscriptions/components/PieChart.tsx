"use client";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { LabelList, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A pie chart with a label list";

interface SubscriptionsChartPieProps<T> {
  data: T[];
  nameKey: keyof T;
  dataKey: keyof T;
}

export function SubscriptionsChartPie<T extends Record<string, any>>({
  data,
  nameKey,
  dataKey,
}: SubscriptionsChartPieProps<T>) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      fill: `var(--chart-${(index % 5) + 1})`,
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      [String(dataKey)]: {
        label: String(dataKey),
      },
    };
    data.forEach((item, index) => {
      const label = String(item[nameKey]);
      config[label] = {
        label: label,
        color: `var(--chart-${(index % 5) + 1})`,
      };
    });
    return config;
  }, [data, dataKey, nameKey]);

  return (
    <ChartContainer
      config={chartConfig}
      className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey={String(dataKey)} hideLabel />}
        />
        <Pie data={chartData} dataKey={String(dataKey)}>
          <LabelList
            dataKey={String(nameKey)}
            className="fill-background"
            stroke="none"
            fontSize={12}
            formatter={(value: keyof typeof chartConfig) =>
              chartConfig[value]?.label
            }
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
