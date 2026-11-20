import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A full-width sign-in button: icon on the left, label centred, optional "Last used" tag. */
export function SocialButton({
  label,
  icon,
  onClick,
  isLoading,
  lastUsed,
  variant = "dark",
  type = "button",
}: {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  lastUsed?: boolean;
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
        <span className="bg-primary absolute -top-2 -right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Last used
        </span>
      )}
    </button>
  );
}
