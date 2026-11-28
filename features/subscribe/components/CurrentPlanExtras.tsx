"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserPlanSummary } from "@/lib/subscription";

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

/**
 * Under the current plan's card: while subscribed the only options are upgrading,
 * buying a credit pack, or waiting for the renewal. A plan set to cancel can be kept.
 */
export function CurrentPlanExtras({ subscription }: { subscription: Partial<UserPlanSummary> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const renewal = fmtDate(subscription.currentPeriodEnd);
  const canceling = !!subscription.cancelAtPeriodEnd;

  const resume = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/user-subscriptions/resume", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? json?.message ?? "Could not keep your plan");
      return json;
    },
    onSuccess: () => {
      toast.success("Your plan will keep renewing.");
      void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mb-2 flex flex-col items-center gap-2 text-center text-[12px] text-muted-foreground">
      {canceling ? (
        <>
          <span>{renewal ? `Ends on ${renewal}` : "Set to end at the end of this period"}</span>
          <button
            type="button"
            onClick={() => resume.mutate()}
            disabled={resume.isPending}
            className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {resume.isPending && <Loader2 className="size-3.5 animate-spin" />}
            Keep my plan (no charge now)
          </button>
        </>
      ) : (
        renewal && <span>Credits refill on {renewal}</span>
      )}
      <Link href="/me/settings/subscription#credit-packs" className="text-foreground/80 underline underline-offset-2 hover:text-foreground">
        Need more credits now? Buy a credit pack
      </Link>
    </div>
  );
}
