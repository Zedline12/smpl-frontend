"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { SettingsPanel } from "@/app/(protected)/(other)/me/settings/_components/SettingsUi";
import { CreditPackPicker, creditPackEligibility } from "./CreditPackPicker";

/** One-time credit packs: only buyable on an active plan. */
export function CreditPacksCard() {
  const { user } = useCurrentUser();
  if (!user) return null;
  const eligibility = creditPackEligibility(user);

  return (
    <div id="credit-packs" className="scroll-mt-24">
      <SettingsPanel icon={Zap} title="Buy more credits">
        {eligibility === "eligible" ? (
          <CreditPackPicker />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="text-sm text-white/60">
              {eligibility === "past_due"
                ? "Update your payment method to buy credit packs."
                : "Credit packs are available on an active plan. They top up your credits for generations."}
            </p>
            {eligibility !== "past_due" && (
              <Link
                href="/pricing"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                See plans
              </Link>
            )}
          </div>
        )}
      </SettingsPanel>
    </div>
  );
}
