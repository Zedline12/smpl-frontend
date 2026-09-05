"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BrandTheme } from "../types";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Absent on a manually created theme, which has no website to link to. */
function hostnameOrNull(url: string | null | undefined): string | null {
  return url ? hostnameOf(url) : null;
}

function relativeTime(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return formatDistanceToNow(date, { addSuffix: true });
}

interface BrandThemeCardProps {
  theme: BrandTheme;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}

export function BrandThemeCard({
  theme,
  isDeleting,
  onDelete,
}: BrandThemeCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const host = hostnameOrNull(theme.websiteUrl);
  const failed = theme.status === "failure";

  const copyColor = async () => {
    if (!theme.primaryColor) return;
    if (!navigator.clipboard?.writeText) {
      toast.info(`Primary colour is ${theme.primaryColor}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(theme.primaryColor);
      setCopied(true);
      toast.success("Colour copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the colour");
    }
  };

  return (
    <div className="border-border bg-card group relative flex flex-col gap-4 rounded-2xl border p-4 transition-colors hover:border-white/20">
      <div className="flex items-start gap-3">
        {/* Arbitrary remote host — next/image would need it whitelisted. */}
        {theme.logoUrl ? (
          <img
            src={theme.logoUrl}
            alt=""
            className="border-border bg-background-light size-11 shrink-0 rounded-xl border object-contain p-1"
          />
        ) : (
          <div className="border-border bg-background-light text-muted-foreground flex size-11 shrink-0 items-center justify-center rounded-xl border text-base font-bold uppercase">
            {(theme.name || host || "?").charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-semibold">
            {theme.name?.trim() || host || "Untitled theme"}
          </p>
          {host && (
            <a
              href={theme.websiteUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground truncate text-xs transition-colors"
            >
              {host}
            </a>
          )}
        </div>

        <button
          type="button"
          aria-label="Delete brand theme"
          onClick={() => setConfirming(true)}
          className="text-muted-foreground hover:bg-background-lighter cursor-pointer rounded-lg p-1.5 opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500 focus-visible:opacity-100 max-sm:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {failed ? (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-xs leading-snug text-red-400">
            {theme.errorMessage || "We couldn't read this site's branding."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Primary colour */}
          <div className="flex items-center gap-2.5">
            {theme.primaryColor ? (
              <button
                type="button"
                onClick={copyColor}
                className="group/color flex cursor-pointer items-center gap-2.5"
                title="Copy hex"
              >
                <span
                  className="size-7 shrink-0 rounded-full border border-white/20"
                  style={{ background: theme.primaryColor }}
                />
                <span className="text-foreground font-mono text-xs uppercase">
                  {theme.primaryColor}
                </span>
                {copied ? (
                  <Check className="size-3 text-green-500" />
                ) : (
                  <Copy className="text-muted-foreground size-3 opacity-0 transition-opacity group-hover/color:opacity-100" />
                )}
              </button>
            ) : (
              <>
                <span className="border-border bg-background-light size-7 shrink-0 rounded-full border" />
                <span className="text-muted-foreground text-xs">
                  No colour detected
                </span>
              </>
            )}
          </div>

          {/* Fonts */}
          <div className="flex flex-wrap gap-1.5">
            {theme.fonts?.length ? (
              theme.fonts.slice(0, 4).map((font) => (
                <span
                  key={font}
                  className="border-border bg-background-light text-foreground/80 rounded-full border px-2 py-0.5 text-[11px]"
                  style={{ fontFamily: `${font}, var(--font-sans)` }}
                >
                  {font}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">
                No fonts detected
              </span>
            )}
          </div>
        </div>
      )}

      <p className="text-muted-foreground mt-auto text-[11px]">
        {relativeTime(theme.createdAt)}
      </p>

      {confirming && (
        <div className="bg-card/95 absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl p-4 text-center backdrop-blur-sm">
          <p className="text-foreground text-sm font-medium">
            Delete this brand theme?
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(theme.id)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-500 transition-colors",
                "hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {isDeleting && <Loader2 className="size-3 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
