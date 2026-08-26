"use client";

import { FormEvent, useState } from "react";
import { Globe, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accepts "acme.com" as well as a full URL; rejects non-http(s) schemes. */
export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

interface CreateBrandThemeFormProps {
  onSubmit: (values: { websiteUrl: string; name?: string }) => void;
  isSubmitting: boolean;
}

export function CreateBrandThemeForm({
  onSubmit,
  isSubmitting,
}: CreateBrandThemeFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    const normalized = normalizeWebsiteUrl(websiteUrl);
    if (!normalized) {
      setError("Enter a valid website address, for example acme.com");
      return;
    }

    setError(null);
    onSubmit({
      websiteUrl: normalized,
      ...(name.trim() ? { name: name.trim() } : {}),
    });
    setWebsiteUrl("");
    setName("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card rounded-2xl border p-4 sm:p-5"
    >
      <h2 className="text-foreground text-sm font-semibold">
        Extract a brand theme
      </h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Paste a website and we&apos;ll pull its colours, fonts and logo.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Globe className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            inputMode="url"
            value={websiteUrl}
            onChange={(event) => {
              setWebsiteUrl(event.target.value);
              if (error) setError(null);
            }}
            placeholder="acme.com"
            aria-label="Website URL"
            aria-invalid={!!error}
            className={cn(
              "border-border bg-background-light text-foreground placeholder:text-muted-foreground h-10 w-full rounded-xl! border! pl-9! text-sm! outline-none!",
              "focus:border-primary/50",
              error && "border-red-500/60!",
            )}
          />
        </div>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Label (optional)"
          aria-label="Theme name"
          className="border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 rounded-xl! border! px-3! text-sm! outline-none! sm:w-48"
        />

        <button
          type="submit"
          disabled={isSubmitting || !websiteUrl.trim()}
          className="bg-gradient-primary flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Extract
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </form>
  );
}
