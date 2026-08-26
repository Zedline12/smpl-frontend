"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { LANDING_FEATURES } from "../constants";
import { FeatureCard } from "./FeatureCard";

/** firstName can be null, so fall back to the email's local part. */
function displayName(user: any): string | null {
  const first = user?.firstName?.trim();
  if (first) return first;
  const email: string | undefined = user?.email;
  const local = email?.split("@")[0]?.trim();
  return local || null;
}

export function HomeWelcome() {
  const { user } = useCurrentUser();
  const name = displayName(user);

  return (
    // pb clears the prompt composer, which is fixed to the bottom of the viewport.
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-44 sm:pb-40">
      <header>
        <h1 className="text-foreground text-2xl font-bold sm:text-3xl">
          Welcome back{name ? `, ${name}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Pick up where you left off, or try something new.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANDING_FEATURES.map((feature) => (
          <FeatureCard key={feature.href} feature={feature} />
        ))}
      </div>
    </div>
  );
}
