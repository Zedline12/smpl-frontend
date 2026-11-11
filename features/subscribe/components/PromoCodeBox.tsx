"use client";

import { FormEvent, useState } from "react";
import { Loader2, Tag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppliedPromotion } from "../hooks/use-promotion-code";

interface PromoCodeBoxProps {
  promotion: AppliedPromotion | null;
  pendingCode: string | null;
  error: string | null;
  isChecking: boolean;
  isSignedIn: boolean;
  onApply: (code: string) => void;
  onClear: () => void;
}

/** "Have a code?" on the pricing page: apply a promotion code, or show the applied one. */
export function PromoCodeBox({
  promotion,
  pendingCode,
  error,
  isChecking,
  isSignedIn,
  onApply,
  onClear,
}: PromoCodeBoxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onApply(value);
  };

  if (promotion) {
    return (
      <div className="flex justify-center mb-8 px-4">
        <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#4ade80]/30 bg-[#4ade80]/10 py-1.5 pl-3 pr-1.5 text-[13px]">
          <Tag className="size-3.5 shrink-0 text-[#4ade80]" />
          <span className="font-mono font-bold text-foreground">{promotion.code}</span>
          <span className="truncate text-foreground/75">· {promotion.summary}</span>
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove code"
            className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (!isSignedIn && pendingCode) {
    return (
      <p className="mb-8 px-4 text-center text-[13px] text-muted-foreground">
        Log in to use code <span className="font-mono font-bold text-foreground">{pendingCode}</span>.
      </p>
    );
  }

  if (!isSignedIn) return null;

  return (
    <div className="mb-8 flex flex-col items-center px-4">
      {!open && !error ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          <Tag className="size-3.5" />
          Have a code?
        </button>
      ) : (
        <form onSubmit={submit} className="flex w-full max-w-[360px] gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
            maxLength={40}
            placeholder="Enter code"
            aria-label="Promotion code"
            className={cn(
              "h-10 min-w-0 flex-1 rounded-[10px] border bg-transparent px-3 font-mono text-[14px] uppercase tracking-wide text-foreground outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground focus:border-foreground/40",
              error ? "border-red-400/60" : "border-foreground/[0.15]",
            )}
          />
          <button
            type="submit"
            disabled={isChecking || !value.trim()}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-foreground px-4 text-[13px] font-bold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isChecking && <Loader2 className="size-3.5 animate-spin" />}
            Apply
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-center text-[12px] text-red-400">{error}</p>}
    </div>
  );
}
