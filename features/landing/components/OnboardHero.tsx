import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import {
  HERO_BULLETS,
  HERO_VIDEO_SRC,
  LANDING_FEATURES,
} from "../constants";
import { FeatureCard } from "./FeatureCard";

/**
 * `--primary` rather than `--color-primary`: the latter is also declared raw and
 * unlayered in globals.css, so it wins the cascade there and would not follow a
 * future theme override. `--primary` is the token .dark/.light actually swap.
 * color-mix supplies the mid-stop alpha, since CSS can't add alpha to a var().
 */
const OVERLAY_GRADIENT =
  "linear-gradient(to right, var(--primary) 0%, " +
  "color-mix(in srgb, var(--primary) 50%, transparent) 48%, transparent 78%)";

export function OnboardHero() {
  return (
    <section
      aria-label="What you can make with SMPL"
      className="animate-fade-in-up grid w-full gap-4 lg:grid-cols-[40fr_60fr]"
    >
      {/* Video promo card */}
      <div className="border-border relative min-h-[300px] overflow-hidden rounded-2xl border lg:h-full lg:min-h-[360px]">
        {/*
          autoPlay + muted + loop + playsInline are all four required for
          autoplay to work on iOS Safari. #t=0.1 makes the browser paint the
          first frame instead of a black box before playback starts.
        */}
        <video
          src={`${HERO_VIDEO_SRC}#t=0.1`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay is its own layer so the CTA below stays clickable. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: OVERLAY_GRADIENT }}
        />

        <div className="relative flex h-full flex-col justify-center gap-4 p-6 sm:p-8">
          <div>
            <p className="text-sm font-medium text-white/70">
              Every AI model you need
            </p>
            <p className="text-2xl leading-tight font-bold text-white sm:text-3xl">
              in one place.
            </p>
          </div>

          <ul className="flex flex-col gap-2">
            {HERO_BULLETS.map((bullet) => (
              <li
                key={bullet}
                className="flex items-center gap-2 text-sm text-white/85"
              >
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <Check className="size-2.5 text-white" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="bg-background text-foreground hover:bg-background-light inline-flex w-fit items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            Start creating free
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {LANDING_FEATURES.map((feature) => (
          <FeatureCard key={feature.href} feature={feature} />
        ))}
      </div>
    </section>
  );
}
