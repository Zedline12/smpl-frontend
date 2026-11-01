"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map } from "lucide-react";
import { SubscribedUser } from "@/features/admin/users/types/types";
import { UsersTable } from "./UsersTable";
import dynamic from "next/dynamic";

const LocationHeatMap = dynamic(() => import("./LocationHeatMap"), { ssr: false });

type SortBy = "" | "date" | "subscriptionPlan";
type SubscriptionFilter = "paid" | "unpaid";

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Default", value: "" },
  { label: "Newest", value: "date" },
  { label: "Highest Plan", value: "subscriptionPlan" },
];

interface PageResult {
  data: SubscribedUser[];
  totalCount: number;
  page: number;
  hasMore: boolean;
}

async function fetchUsers(
  sortBy: SortBy,
  subscriptionFilter: SubscriptionFilter,
  page: number,
): Promise<PageResult> {
  const params = new URLSearchParams({
    isSubscribed: subscriptionFilter === "paid" ? "true" : "false",
    page: String(page),
    limit: "10",
  });
  if (sortBy) params.set("sortBy", sortBy);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data ?? json;
}

export default function UsersPageClient() {
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>("paid");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<SubscribedUser[]>([]);
  const [mapOpen, setMapOpen] = useState(false);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin-users", sortBy, subscriptionFilter, page],
    queryFn: () => fetchUsers(sortBy, subscriptionFilter, page),
    placeholderData: (prev) => prev,
  });

  const displayedUsers = useCallback(() => {
    if (!data?.data) return accumulated;
    if (page === 1) return data.data;
    return accumulated;
  }, [data, page, accumulated]);

  const handleFilterChange = (newFilter: SubscriptionFilter) => {
    setSubscriptionFilter(newFilter);
    setPage(1);
    setAccumulated([]);
  };

  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort);
    setPage(1);
    setAccumulated([]);
  };

  const handleSeeMore = () => {
    const nextPage = page + 1;
    const currentData = data?.data ?? [];
    setAccumulated((prev) => (page === 1 ? currentData : [...prev, ...currentData]));
    setPage(nextPage);
  };

  const users = page === 1 ? (data?.data ?? []) : accumulated;
  const hasMore = data?.hasMore ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Heat map button */}
        <button
          onClick={() => setMapOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-neutral-500 hover:text-foreground"
        >
          <Map className="h-3.5 w-3.5" />
          Heat Map
        </button>

        {/* Subscription filter */}
        <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800/50 p-1 gap-1">
          <button
            onClick={() => handleFilterChange("paid")}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
              subscriptionFilter === "paid"
                ? "bg-neutral-700 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => handleFilterChange("unpaid")}
            className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
              subscriptionFilter === "unpaid"
                ? "bg-neutral-700 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Unpaid
          </button>
        </div>

        {/* Sort filter */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground font-medium">Sort by</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortBy)}
            className="text-sm rounded-md border border-neutral-700 bg-background px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-neutral-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {data?.totalCount !== undefined && (
          <span className="text-xs text-muted-foreground ml-auto">
            {data.totalCount} user{data.totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isError && (
        <p className="text-sm text-destructive">Failed to load users. Please try again.</p>
      )}

      <UsersTable users={users} isLoading={isLoading} />

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleSeeMore}
            disabled={isFetching}
            className="rounded-lg border border-neutral-700 bg-neutral-800/50 px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-neutral-500 hover:text-foreground disabled:opacity-50"
          >
            {isFetching ? "Loading…" : "See more"}
          </button>
        </div>
      )}

      {mapOpen && (
        <LocationHeatMap
          isSubscribed={subscriptionFilter === "paid" ? true : false}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
