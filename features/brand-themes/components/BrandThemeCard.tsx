"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Check,
  Copy,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getThemeCardStyle } from "../color";
import { BrandTheme, getThemeFonts } from "../types";
import { EditBrandThemeDialog } from "./EditBrandThemeDialog";

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
  const [editing, setEditing] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const host = hostnameOrNull(theme.websiteUrl);
  const failed = theme.status === "failure";
  const fonts = getThemeFonts(theme);

  // The card takes on the brand: gradient with two colours, solid with one.
  const { background, isLight } = getThemeCardStyle(theme);
  const tinted = !!background && !failed;
  const ink = isLight ? "#0b0b0f" : "#ffffff";
  const softBorder = isLight ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.3)";
  const softFill = isLight ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.22)";

  const copyColor = async (color: string) => {
    if (!navigator.clipboard?.writeText) {
      toast.info(`Colour is ${color}`);
      return;
    }
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      toast.success("Colour copied");
      setTimeout(() => setCopiedColor(null), 2000);
    } catch {
      toast.error("Could not copy the colour");
    }
  };

  const colors = [theme.primaryColor, theme.secondaryColor].filter(
    (color): color is string => !!color,
  );

  return (
    <div
      className={cn(
        "group relative flex min-h-64 flex-col gap-6 rounded-2xl border p-6 transition-shadow",
        tinted
          ? "hover:shadow-xl"
          : "border-border bg-card hover:border-white/20",
      )}
      style={
        tinted
          ? { background: background!, color: ink, borderColor: softBorder }
          : undefined
      }
    >
      <div className="flex items-start gap-4">
        {/* Arbitrary remote host — next/image would need it whitelisted. */}
        {theme.logoUrl ? (
          <img
            src={theme.logoUrl}
            alt=""
            className={cn(
              "size-16 shrink-0 rounded-2xl border object-contain p-1.5",
              !tinted && "border-border bg-background-light",
            )}
            style={
              tinted
                ? { borderColor: softBorder, background: softFill }
                : undefined
            }
          />
        ) : (
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center rounded-2xl border text-2xl font-bold uppercase",
              !tinted && "border-border bg-background-light text-muted-foreground",
            )}
            style={
              tinted
                ? { borderColor: softBorder, background: softFill }
                : undefined
            }
          >
            {(theme.name || host || "?").charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-xl leading-tight font-bold",
              !tinted && "text-foreground",
            )}
          >
            {theme.name?.trim() || host || "Untitled theme"}
          </p>
          {host && (
            <a
              href={theme.websiteUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-0.5 block truncate text-sm transition-opacity",
                tinted
                  ? "opacity-75 hover:opacity-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {host}
            </a>
          )}
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label="Edit brand theme"
            onClick={() => setEditing(true)}
            className={cn(
              "cursor-pointer rounded-lg p-2 opacity-0 transition-colors group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
              tinted
                ? "hover:bg-black/15"
                : "text-muted-foreground hover:bg-background-lighter hover:text-foreground",
            )}
          >
            <Pencil className="size-[18px]" />
          </button>
          <button
            type="button"
            aria-label="Delete brand theme"
            onClick={() => setConfirming(true)}
            className={cn(
              "cursor-pointer rounded-lg p-2 opacity-0 transition-colors group-hover:opacity-100 focus-visible:opacity-100 max-sm:opacity-100",
              tinted
                ? "hover:bg-black/15"
                : "text-muted-foreground hover:bg-background-lighter hover:text-red-500",
            )}
          >
            <Trash2 className="size-[18px]" />
          </button>
        </div>
      </div>

      {failed ? (
        <div className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-xs leading-snug text-red-400">
            {theme.errorMessage || "We couldn't read this site's branding."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Colours */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {colors.length ? (
              colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => copyColor(color)}
                  className="group/color flex cursor-pointer items-center gap-2.5"
                  title="Copy hex"
                >
                  <span
                    className="size-9 shrink-0 rounded-full border-2"
                    style={{
                      background: color,
                      borderColor: tinted ? ink : "rgba(255,255,255,0.2)",
                    }}
                  />
                  <span
                    className={cn(
                      "font-mono text-sm uppercase",
                      !tinted && "text-foreground",
                    )}
                  >
                    {color}
                  </span>
                  {copiedColor === color ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5 opacity-0 transition-opacity group-hover/color:opacity-70" />
                  )}
                </button>
              ))
            ) : (
              <>
                <span className="border-border bg-background-light size-9 shrink-0 rounded-full border" />
                <span className="text-muted-foreground text-sm">
                  No colour detected
                </span>
              </>
            )}
          </div>

          {/* Fonts */}
          <div className="flex flex-wrap gap-2">
            {fonts.length ? (
              fonts.map((font) => (
                <span
                  key={font}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm",
                    !tinted && "border-border bg-background-light text-foreground/80",
                  )}
                  style={{
                    fontFamily: `${font}, var(--font-sans)`,
                    ...(tinted
                      ? { borderColor: softBorder, background: softFill }
                      : {}),
                  }}
                >
                  {font}
                </span>
              ))
            ) : (
              <span
                className={cn(
                  "text-sm",
                  tinted ? "opacity-70" : "text-muted-foreground",
                )}
              >
                No fonts detected
              </span>
            )}
          </div>
        </div>
      )}

      <p
        className={cn(
          "mt-auto text-xs",
          tinted ? "opacity-70" : "text-muted-foreground",
        )}
      >
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

      <EditBrandThemeDialog
        theme={theme}
        open={editing}
        onOpenChange={setEditing}
      />
    </div>
  );
}
