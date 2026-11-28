"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Map, Search, X } from "lucide-react";
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
  search: string,
): Promise<PageResult> {
  const isBillingFilter = BILLING_FILTERS.includes(subscriptionFilter);
  // A search looks through every user, whatever filter is picked.
  const params = new URLSearchParams({
    isSubscribed: search ? "all" : isBillingFilter ? "all" : subscriptionFilter === "paid" ? "true" : "false",
    page: String(page),
    limit: "10",
  });
  if (search) params.set("search", search);
  else if (isBillingFilter) params.set("billing", subscriptionFilter);
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Search 300 ms after typing stops, from the first page.
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;
    const t = setTimeout(() => {
      setSearch(next);
      setPage(1);
      setAccumulated([]);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["admin-users", sortBy, subscriptionFilter, page, search],
    queryFn: () => fetchUsers(sortBy, subscriptionFilter, page, search),
    placeholderData: (prev) => prev,
  });

  const displayedUsers = useCallback(() => {
    if (!data?.data) return accumulated;
    if (page === 1) return data.data;
    return accumulated;
  }, [data, page, accumulated]);

  const handleFilterChange = (newFilter: SubscriptionFilter) => {
    // Picking a filter leaves the search.
    setSearchInput("");
    setSearch("");
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
        {/* Search by email (searches every user, ignoring the filter) */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by email"
            aria-label="Search users by email"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800/50 py-1.5 pr-8 pl-8 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-neutral-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

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
                !search && subscriptionFilter === f.value
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
