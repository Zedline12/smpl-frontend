"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SubscribedUser } from "@/features/admin/users/types/types";
import { UsersTable } from "./UsersTable";

type SortBy = "" | "date" | "subscriptionPlan";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Default", value: "" },
  { label: "Newest", value: "date" },
  { label: "Highest Plan", value: "subscriptionPlan" },
];

async function fetchSubscribedUsers(sortBy: SortBy): Promise<SubscribedUser[]> {
  const params = new URLSearchParams({ isSubscribed: "true" });
  if (sortBy) params.set("sortBy", sortBy);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data;
}

export default function UsersPageClient() {
  const [sortBy, setSortBy] = useState<SortBy>("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-subscribed-users", sortBy],
    queryFn: () => fetchSubscribedUsers(sortBy),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground font-medium">Sort by</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="text-sm rounded-md border border-neutral-700 bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <p className="text-sm text-destructive">Failed to load users. Please try again.</p>
      )}

      <UsersTable users={data ?? []} isLoading={isLoading} />
    </div>
  );
}
