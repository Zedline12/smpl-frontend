"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { SubscriptionPlan } from "@/lib/types/subscription-plan.type";

export default function MySubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/subscription-plans");
        const json = await res.json();
        if (json.data) {
          setPlans(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (!user) {
    return null;
  }

  const currentPlan = plans.find((p) => p.id === user.subscription?.id);

  // Calculate usage percentage
  // Assuming creditsBalance is remaining credits
  const totalCredits = currentPlan?.creditsPerMonth || 0;
  const remainingCredits = user.creditsBalance || 0;
  const usedCredits = totalCredits - remainingCredits;
  const usagePercentage =
    totalCredits > 0
      ? Math.min(Math.max((usedCredits / totalCredits) * 100, 0), 100)
      : 0;

  return (
    <div className="container mx-auto p-6 md:p-10 max-w-4xl ">
      <div className="space-y-8">
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-3xl font-bold text-primary-foreground">
            My Subscription
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your current plan and billing details
          </p>
        </div>

        <div className="grid gap-8">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-secondary-foreground">
              Current Plan
            </h2>
            <div className="bg-background-light border border-white/5 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-3xl font-bold text-primary-foreground capitalize mb-1">
                    {user.subscription.name}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    You are currently subscribed to the {user.subscription.name} plan.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    className="bg-gradient-primary text-white border-none hover:opacity-90 transition-opacity"
                    onClick={() => router.push("/subscription-plans")}
                  >
                    Upgrade
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => router.push("/")}
                  >
                    Cancel My Subscription
                  </Button>
                </div>
              </div>

              {currentPlan && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credits Usage</span>
                    <span className="text-primary-foreground font-medium">
                      {usedCredits} / {totalCredits} Used
                    </span>
                  </div>
                  <div className="h-3 w-full bg-secondary/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {remainingCredits} credits remaining
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
