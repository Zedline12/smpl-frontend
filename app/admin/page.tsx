import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartBarInteractive } from "@/features/admin/components/BarChart";
import { fetchWithToken } from "@/lib/fetcher";
import { Tabs } from "@radix-ui/react-tabs";

interface PaymentStats {
  totalRevenue: number;
  salesCount: number;
  subStats: {
    active: number;
    canceled: number;
    pastDue: number;
    trialing: number;
    total: number;
  };
}

export default async function AdminPage() {
  const json = await fetchWithToken("/payments/stats").then((res) =>
    res.json(),
  );
  const stats: PaymentStats = json.data;

  return (
    <div className="space-y-8 ">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Dashboard Overview
        </h2>
        <p className="text-gray-400">
          Welcome back! Here's what's happening today.
        </p>
      </div>
      <Tabs>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="bg-background-light text-foreground border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-secondary"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl  font-bold">
                ${stats.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background-light text-foreground border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-secondary"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.salesCount}</div>
            </CardContent>
          </Card>
          <Card className="bg-background-light text-foreground border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-secondary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subStats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-background-light text-foreground border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Canceled Subscriptions
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-secondary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.subStats.canceled}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background-light text-foreground border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Past Due Subscriptions
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-secondary"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subStats.pastDue}</div>
            </CardContent>
          </Card>
        </div>
      </Tabs>
      <ChartBarInteractive />
    </div>
  );
}
