"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";

const monthly = (p?: Pick<SubscriptionPlan, "priceAmount" | "billingPeriod"> | null) =>
  !p ? 0 : p.billingPeriod === "YEARLY" ? p.priceAmount / 12 : p.priceAmount;

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The plan the user is on now (may be unknown). */
  currentPlan?: SubscriptionPlan | null;
  targetPlan: SubscriptionPlan | null;
  onConfirm: () => void;
  isLoading: boolean;
}

/** Confirms an upgrade or downgrade of an existing paid plan. */
export function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  onConfirm,
  isLoading,
}: ChangePlanDialogProps) {
  if (!targetPlan) return null;
  const isUpgrade = monthly(targetPlan) >= monthly(currentPlan);

  return (
    <Dialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <DialogContent className="bg-card border-border max-w-sm rounded-2xl border">
        <DialogHeader>
          <DialogTitle>
            {isUpgrade ? "Upgrade" : "Switch"} to {targetPlan.name}?
          </DialogTitle>
          <DialogDescription>
            {isUpgrade
              ? "You'll be charged the difference for the rest of this billing period now, and the extra credits are added right away."
              : "Your new price starts with your next bill. You keep your current credits until then."}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-accent flex-1 rounded-lg border py-2.5 text-sm font-medium disabled:opacity-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-primary text-primary-foreground flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isUpgrade ? "Upgrade now" : "Switch plan"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
