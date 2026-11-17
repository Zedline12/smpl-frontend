"use client";
import Link from "next/link";
import { AlertTriangle, Loader2, Palette, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { brandPalette } from "../color";
import { useBrandQueuesQuery, useBrandsQuery } from "../hooks/use-brands";
import { Brand, isActiveStatus } from "../types";

function BrandCard({ brand }: { brand: Brand }) {
  const palette = brandPalette(brand);
  const busy = isActiveStatus(brand.status);
  const failed = brand.status === "failure";

  return (
    <Link
      href={`/ads-studio/brands/${brand.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] transition-colors hover:border-white/20"
    >
      {/* Palette strip */}
      <div className="flex h-16">
        {palette.length ? (
          palette
            .slice(0, 6)
            .map((c, i) => (
              <span
                key={`${c}-${i}`}
                className="flex-1"
                style={{ background: c }}
              />
            ))
        ) : (
          <span className="flex-1 bg-white/[0.04]" />
        )}
      </div>

      <div className="flex items-start gap-3 p-4">
        <span className="-mt-9 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#17171c] shadow-lg">
          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt=""
              className="max-h-full max-w-full object-contain p-2"
            />
          ) : (
            <Palette className="size-5 text-white/40" />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            className="truncate text-base font-black tracking-tight text-white uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {brand.name}
          </span>
          <span className="truncate text-sm text-white/55">
            {busy
              ? "Reading the website…"
              : failed
                ? "Couldn't read the website"
                : brand.tagline || brand.websiteUrl || "Brand kit"}
          </span>
        </div>
        {busy && (
          <Loader2 className="text-primary size-4 shrink-0 animate-spin" />
        )}
        {failed && <AlertTriangle className="size-4 shrink-0 text-amber-300" />}
      </div>

      {!busy &&
        !failed &&
        (brand.toneOfVoice.length > 0 || brand.aesthetics.length > 0) && (
          <div className="flex flex-wrap gap-1.5 px-4 pb-4">
            {[...brand.toneOfVoice, ...brand.aesthetics]
              .slice(0, 4)
              .map((tag) => (
                <span
                  key={tag}
                  className="max-w-full truncate rounded-full bg-white/[0.07] px-2.5 py-0.5 text-[11px] text-white/70"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
    </Link>
  );
}

/** Ads Studio → Brands: the user's brand kits. */
export function BrandsList() {
  const { data: brands = [], isFetched } = useBrandsQuery();
  // Keeps extraction progress fresh when live updates are down.
  useBrandQueuesQuery();

  const newButton = (
    <Link
      href="/ads-studio/brands/create"
      className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-colors"
    >
      <Plus className="size-4" /> New brand
    </Link>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Brands</h1>
          <p className="mt-1 text-sm text-white/55">
            Your brand kits: colours, logo, selling points, audience and tone.
            Pick one in the composer.
          </p>
        </div>
        {brands.length > 0 && newButton}
      </header>

      {!isFetched ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-3xl bg-white/[0.04]"
            />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/60">
            <Palette className="size-6" />
          </span>
          <p className="font-semibold text-white">No brands yet</p>
          <p className="max-w-sm text-sm text-white/50">
            Enter your website and we&apos;ll build your brand kit, or make one
            by hand.
          </p>
          {newButton}
        </div>
      ) : (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3")}>
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div>
      )}
    </div>
  );
}
