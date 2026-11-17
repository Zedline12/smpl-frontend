"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Loader2, Sparkles } from "lucide-react";
import { useCreateBrandFromWebsite } from "../hooks/use-brands";
import { BrandShell } from "./BrandShell";
import { toUrl } from "./BrandKitEditor";

/** "Enter your website": extract a brand kit from it, or start one by hand. */
export function NewBrandScreen() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const extract = useCreateBrandFromWebsite();
  const url = toUrl(website);
  let valid = false;
  try {
    valid = !!url && new URL(url).hostname.includes(".");
  } catch {
    valid = false;
  }

  const start = () => {
    if (!valid || !url) return;
    extract.mutate(url, {
      onSuccess: (brand) => router.push(`/ads-studio/brands/${brand.id}`),
    });
  };

  return (
    <BrandShell
      title="Enter your website"
      subtitle="We'll read your site and put together your brand kit"
      className="pt-16 sm:pt-24"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          start();
        }}
        className="flex w-full max-w-md flex-col gap-3"
      >
        <label className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 focus-within:border-white/25">
          <Globe className="size-5 shrink-0 text-white/45" strokeWidth={1.75} />
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.yourwebsite.com"
            aria-label="Your website"
            inputMode="url"
            autoComplete="url"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
          />
        </label>
        <button
          type="submit"
          disabled={!valid || extract.isPending}
          className="bg-primary hover:bg-primary/90 flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-white shadow-[0_8px_30px_-10px_var(--color-primary)] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          {extract.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          Create my brand
        </button>

        <div className="flex items-center gap-3 py-2 text-xs text-white/40">
          <span className="h-px flex-1 bg-white/[0.08]" />
          or
          <span className="h-px flex-1 bg-white/[0.08]" />
        </div>

        <Link
          href="/ads-studio/brands/manual"
          className="flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.1] to-white/[0.04] text-[15px] font-semibold text-white transition-colors hover:from-white/[0.14]"
        >
          Create brand kit manually
        </Link>
      </form>
    </BrandShell>
  );
}
