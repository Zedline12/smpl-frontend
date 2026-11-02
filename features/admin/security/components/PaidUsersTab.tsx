"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Coins, Globe } from "lucide-react";
import { toast } from "sonner";
import {
  countryFlag,
  fetchPaidUsers,
  invalidateSecurityQueries,
  patchUser,
} from "../api";
import { ListSpinner, SecurityBadges, SeeMoreButton, SuspendButton } from "./SecurityBadges";

export default function PaidUsersTab() {
  const qc = useQueryClient();

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["security-paid-users"],
      queryFn: ({ pageParam }) => fetchPaidUsers(pageParam),
      initialPageParam: 1,
      getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    });

  const users = data?.pages.flatMap((p) => p.data ?? []) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const flaggedCount = users.filter((u) => u.isThreat || u.isProxy || u.isVpn).length;

  const suspendMutation = useMutation({
    mutationFn: ({ userId, isSuspended }: { userId: string; isSuspended: boolean }) =>
      patchUser(userId, isSuspended),
    onSuccess: (_, { isSuspended }) => {
      toast.success(isSuspended ? "User suspended and IP blocked" : "User unsuspended");
      invalidateSecurityQueries(qc);
    },
    onError: () => toast.error("Action failed"),
  });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Paid users</h2>
          <p className="text-xs text-muted-foreground">
            IP and threat data is checked when a user opens Stripe checkout. Flagged users are listed first.
          </p>
        </div>
        {!isLoading && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {totalCount} paid · {flaggedCount} flagged in view
          </p>
        )}
      </div>

      {isLoading ? (
        <ListSpinner />
      ) : isError ? (
        <p className="py-8 text-center text-sm text-red-300">Couldn&apos;t load paid users.</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No paid users yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((u) => {
            const flagged = u.isThreat || u.isProxy;
            return (
              <div
                key={u.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                  flagged ? "border-red-700/30 bg-red-950/20" : "border-white/10 bg-neutral-900/40"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <p className="text-sm font-medium truncate">{u.firstName || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-mono text-muted-foreground/80">
                      {u.clientIp || "No IP yet"}
                    </span>
                    {u.country ? (
                      <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                        <span aria-hidden>{countryFlag(u.countryCode) || <Globe className="h-3 w-3" />}</span>
                        {[u.city, u.country].filter(Boolean).join(", ")}
                      </span>
                    ) : null}
                    <SecurityBadges user={u} showClean={!!u.clientIp} />
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums">
                      <Coins className="h-3.5 w-3.5 text-amber-300" />
                      {(u.creditsBalance ?? 0).toLocaleString()}
                    </p>
                    {u.subscriptionPlanName && (
                      <p className="text-[11px] text-muted-foreground">{u.subscriptionPlanName}</p>
                    )}
                  </div>
                  <a
                    href={`/admin/users/${u.id}`}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-muted-foreground hover:border-white/20 hover:text-foreground transition-colors"
                  >
                    View
                  </a>
                  <SuspendButton
                    suspended={u.isSuspended}
                    disabled={suspendMutation.isPending}
                    onClick={() =>
                      suspendMutation.mutate({ userId: u.id, isSuspended: !u.isSuspended })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <SeeMoreButton onClick={() => fetchNextPage()} loading={isFetchingNextPage} />
      )}
    </section>
  );
}
