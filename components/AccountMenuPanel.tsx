"use client";

import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Crown,
  LogOut,
  Palette,
  Share2,
  Sparkles,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreditsAllowance } from "@/features/subscribe/hooks/use-credits-allowance";

const AVATAR_GRADIENT =
  "linear-gradient(135deg, #ea4bff 0%, #2fcefd 55%, #ff6b00 100%)";

const DOT_COUNT = 20;

const NAV_ROWS: {
  href: string;
  label: string;
  icon: typeof User;
  isNew?: boolean;
}[] = [
  { href: "/settings/account", label: "Manage Account", icon: User },
  { href: "/settings/credits-usage", label: "Credits & Usage", icon: Sparkles },
  {
    href: "/settings/referrals",
    label: "Affiliate program",
    icon: Share2,
    isNew: true,
  },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/appearance", label: "Appearance", icon: Palette },
];

const ROW_CLASS =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors";

/** Full-bleed divider — the negative margin clears the panel's padding. */
function Divider() {
  return <div className="bg-border -mx-1 my-1.5 h-px" />;
}

/** `firstName` can be null, so fall back to the email's local part. */
function displayName(user: any): string {
  const first = user?.firstName?.trim();
  if (first) return first;
  const local = user?.email?.split("@")[0]?.trim();
  return local || "Your account";
}

interface AccountMenuPanelProps {
  user: any;
  onNavigate: () => void;
  onSignOut: () => void;
}

export function AccountMenuPanel({
  user,
  onNavigate,
  onSignOut,
}: AccountMenuPanelProps) {
  const { remaining, allowance, usedPercentage, hasAllowance } =
    useCreditsAllowance(user);

  const planName: string = user?.subscription?.name ?? "Free Plan";
  const isFreePlan = planName === "Free Plan";
  const filledDots = hasAllowance
    ? Math.round(((100 - usedPercentage) / 100) * DOT_COUNT)
    : 0;

  return (
    <div className="border-border bg-popover absolute top-full right-0 mt-2 w-72 rounded-2xl border p-1.5 shadow-lg">
      {/* Identity */}
      <div className="flex items-center gap-2.5 px-2 py-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full p-[2px]"
          style={{ background: AVATAR_GRADIENT }}
        >
          <span className="flex size-full items-center justify-center rounded-full bg-neutral-900">
            <User className="size-4 text-white" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">
            {displayName(user)}
          </p>
          <p className="text-muted-foreground truncate text-xs">{planName}</p>
        </div>
      </div>

      {/* Credits */}
      <div className="bg-muted/50 mx-1 mt-1 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Credits
          </span>
          <Link
            href="/settings/credits-usage"
            onClick={onNavigate}
            className="text-foreground hover:text-primary flex items-center gap-0.5 text-xs font-semibold transition-colors"
          >
            {remaining.toLocaleString("en-US")} left
            <ChevronRight className="size-3" />
          </Link>
        </div>

        {/* Only shown when the plan lookup actually produced an allowance. */}
        {hasAllowance && (
          <div
            className="mt-2 flex items-center gap-[3px]"
            role="progressbar"
            aria-valuenow={remaining}
            aria-valuemin={0}
            aria-valuemax={allowance}
            aria-label="Credits remaining"
          >
            {Array.from({ length: DOT_COUNT }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  index < filledDots ? "bg-primary" : "bg-foreground/15",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upgrade / manage */}
      {isFreePlan ? (
        <div className="bg-primary/10 mx-1 mt-1.5 flex items-center justify-between gap-2 rounded-xl p-2.5">
          <span className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Crown className="text-primary size-4" />
            Go Premium
          </span>
          <Link
            href="/subscription-plans"
            onClick={onNavigate}
            className="bg-primary rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Upgrade
          </Link>
        </div>
      ) : (
        <Link
          href="/my-subscription"
          onClick={onNavigate}
          className={cn(ROW_CLASS, "text-foreground hover:bg-accent mt-1.5")}
        >
          <Crown className="text-primary size-4 shrink-0" />
          Manage subscription
        </Link>
      )}

      <Divider />

      {NAV_ROWS.map((row) => {
        const Icon = row.icon;
        return (
          <Link
            key={row.href}
            href={row.href}
            onClick={onNavigate}
            className={cn(ROW_CLASS, "text-foreground hover:bg-accent")}
          >
            <Icon className="text-muted-foreground size-4 shrink-0" />
            {row.label}
            {row.isNew && (
              <span className="bg-secondary/15 text-secondary ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                New
              </span>
            )}
          </Link>
        );
      })}

      <Divider />

      <button
        type="button"
        onClick={onSignOut}
        className={cn(ROW_CLASS, "text-red-500 hover:bg-red-500/10")}
      >
        <LogOut className="size-4 shrink-0" />
        Sign Out
      </button>
    </div>
  );
}
