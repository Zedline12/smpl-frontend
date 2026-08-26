import Link from "next/link";
import { LandingFeature } from "../constants";

export function FeatureCard({ feature }: { feature: LandingFeature }) {
  const Icon = feature.icon;

  return (
    <Link
      href={feature.href}
      // hover:border-primary/40 rather than the repo's usual hover:border-white/20,
      // which is invisible against the light theme's card surface.
      className="border-border bg-card hover:border-primary/40 flex flex-col gap-3 rounded-2xl border p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
          <Icon className="size-4.5" />
        </span>

        {feature.isNew && (
          <span className="bg-secondary/15 text-secondary rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
            New
          </span>
        )}
      </div>

      <div>
        <p className="text-foreground text-sm font-semibold">{feature.title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
          {feature.subtitle}
        </p>
      </div>
    </Link>
  );
}
