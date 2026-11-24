import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A full-width sign-in button: icon on the left, label centred, optional "Last used" tag and badge. */
export function SocialButton({
  label,
  icon,
  onClick,
  isLoading,
  lastUsed,
  badge,
  variant = "dark",
  type = "button",
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  lastUsed?: boolean;
  /** A tag on the top-right corner (e.g. "+50 free credits"); "Last used" moves left. */
  badge?: ReactNode;
  variant?: "light" | "dark";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative flex h-12 w-full cursor-pointer items-center justify-center rounded-xl px-12 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70",
        variant === "light"
          ? "bg-white text-neutral-900 hover:bg-white/90"
          : "bg-white/[0.07] text-white hover:bg-white/[0.11]",
      )}
    >
      <span className="absolute left-4 flex items-center justify-center">
        {isLoading ? (
          <span
            className={cn(
              "size-4 animate-spin rounded-full border-2",
              variant === "light"
                ? "border-black/20 border-t-black/70"
                : "border-white/30 border-t-white",
            )}
          />
        ) : (
          icon
        )}
      </span>
      {label}
      {lastUsed && (
        <span
          className={cn(
            "bg-primary absolute -top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white",
            badge ? "-left-1.5" : "-right-1.5",
          )}
        >
          Last used
        </span>
      )}
      {badge && (
        <span className="from-primary to-secondary absolute -top-2.5 -right-1.5 flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[11px] font-bold text-white shadow-[0_4px_14px_-4px_var(--color-primary)]">
          {badge}
        </span>
      )}
    </button>
  );
}
