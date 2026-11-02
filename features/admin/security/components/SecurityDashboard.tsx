"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Ban, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ThreatUsersTab from "./ThreatUsersTab";
import PaidUsersTab from "./PaidUsersTab";
import BlockedIpsTab from "./BlockedIpsTab";

const TABS = [
  { value: "threats", label: "Threat users", icon: AlertTriangle },
  { value: "paid", label: "Paid users", icon: CreditCard },
  { value: "blocked", label: "Blocked IPs", icon: Ban },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function SecurityTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const param = searchParams.get("tab");
  const tab: TabValue = TABS.some((t) => t.value === param) ? (param as TabValue) : "threats";

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "threats") params.delete("tab");
    else params.set("tab", value);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-6">
      <TabsList className="h-10">
        {TABS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="px-3">
            <Icon />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="threats">
        <ThreatUsersTab />
      </TabsContent>
      <TabsContent value="paid">
        <PaidUsersTab />
      </TabsContent>
      <TabsContent value="blocked">
        <BlockedIpsTab />
      </TabsContent>
    </Tabs>
  );
}

export default function SecurityDashboard() {
  return (
    <Suspense fallback={null}>
      <SecurityTabs />
    </Suspense>
  );
}
