"use client";

import { useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Map } from "lucide-react";
import { SubscribedUser } from "@/features/admin/users/types/types";
import { UsersTable } from "./UsersTable";
import dynamic from "next/dynamic";

const LocationHeatMap = dynamic(() => import("./LocationHeatMap"), { ssr: false });

type SortBy = "" | "date" | "subscriptionPlan";
type SubscriptionFilter = "paid" | "unpaid" | "lapsed" | "past_due" | "canceling" | "ever_paid";

/** Paying now / not paying, then billing-history filters. */
const FILTERS: { label: string; value: SubscriptionFilter }[] = [
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Lapsed", value: "lapsed" },
  { label: "Past due", value: "past_due" },
  { label: "Canceling", value: "canceling" },
  { label: "Ever paid", value: "ever_paid" },
];
const BILLING_FILTERS: SubscriptionFilter[] = ["lapsed", "past_due", "canceling", "ever_paid"];

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
  const isBillingFilter = BILLING_FILTERS.includes(subscriptionFilter);
  const params = new URLSearchParams({
    isSubscribed: isBillingFilter ? "all" : subscriptionFilter === "paid" ? "true" : "false",
    page: String(page),
    limit: "10",
  });
  if (isBillingFilter) params.set("billing", subscriptionFilter);
  if (sortBy) params.set("sortBy", sortBy);
  const res = await fetch(`/api/admin/users?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const json = await res.json();
  return json.data ?? json;
}

export default function UsersPageClient() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortBy>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<SubscriptionFilter>(() => {
    const fromUrl = searchParams.get("billing") as SubscriptionFilter | null;
    return fromUrl && FILTERS.some((f) => f.value === fromUrl) ? fromUrl : "paid";
  });
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
        <div className="flex flex-wrap items-center rounded-lg border border-neutral-700 bg-neutral-800/50 p-1 gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                subscriptionFilter === f.value
                  ? "bg-neutral-700 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
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
          isSubscribed={subscriptionFilter !== "unpaid"}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
