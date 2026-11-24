"use client";
import { forwardRef, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComposerChipProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value"
> {
  icon: LucideIcon;
  label: string;
  /** What's picked (replaces the label), e.g. a product name. */
  value?: ReactNode;
  /** Small square image shown before the value. */
  thumb?: string | null;
  onClear?: () => void;
}

/** A chip in the composer's bottom row; it opens a menu (used as a DropdownMenu trigger). */
export const ComposerChip = forwardRef<HTMLButtonElement, ComposerChipProps>(
  function ComposerChip(
    { icon: Icon, label, value, thumb, onClear, className, ...props },
    ref,
  ) {
    const picked = value !== undefined && value !== null && value !== "";
    return (
      <span className="relative inline-flex shrink-0">
        <button
          ref={ref}
          type="button"
          {...props}
          className={cn(
            "flex h-8 max-w-48 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-medium transition-colors",
            picked
              ? "border-primary/40 bg-primary/15 text-white"
              : "border-white/[0.08] bg-white/[0.05] text-white/80 hover:bg-white/[0.09] hover:text-white",
            picked && onClear && "pr-7",
            "data-[state=open]:border-white/25",
            className,
          )}
        >
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" decoding="async"
              src={thumb}
              alt=""
              className="size-5 shrink-0 rounded object-cover"
            />
          ) : (
            <Icon className="size-3.5 shrink-0" strokeWidth={2} />
          )}
          <span className="truncate">{picked ? value : label}</span>
        </button>
        {picked && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label}`}
            className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="size-3" />
          </button>
        )}
      </span>
    );
  },
);

/** Menu panel styling shared by the composer's pickers. */
export const PICKER_CONTENT_CLASS =
  "tw-fields w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#141418]/95 p-2 text-white shadow-2xl backdrop-blur-xl";

export function PickerHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-2 pt-1 pb-2">
      <span className="text-xs font-semibold tracking-wide text-white/50 uppercase">
        {title}
      </span>
      {action}
    </div>
  );
}
