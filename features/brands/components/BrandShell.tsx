"use client";
import type { ReactNode } from "react";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

/** The brand-kit screens' frame: a faint dot field, the Ads Studio badge and a big heading. */
export function BrandShell({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-full">
      {/* Dot field, faded at the edges so it only sits behind the heading. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1.2px)",
          backgroundSize: "9px 9px",
          maskImage:
            "radial-gradient(ellipse 55% 70% at 50% 15%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 55% 70% at 50% 15%, black, transparent 75%)",
        }}
      />
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 pt-10 pb-28 sm:px-6",
          className,
        )}
      >
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="border-primary/40 bg-primary/10 text-primary flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase">
            <Megaphone className="size-3.5" />
            Ads Studio
          </span>
          <h1
            className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-3xl leading-none font-black tracking-tight text-transparent uppercase sm:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
          <p className="text-sm text-white/55">{subtitle}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

/** A section card of the kit editor, with an icon bubble and label. */
export function KitCard({
  icon,
  label,
  children,
  className,
}: {
  icon?: ReactNode;
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-3 rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 sm:p-6",
        className,
      )}
    >
      {(icon || label) && (
        <div className="flex flex-col gap-2">
          {icon && (
            <span className="bg-primary flex size-7 items-center justify-center rounded-full text-white [&_svg]:size-4">
              {icon}
            </span>
          )}
          {label && (
            <span className="text-xs font-semibold text-white/60">{label}</span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/** Text inputs that look like plain text until focused (the kit reads like a document). */
export const ghostInput =
  "w-full rounded-lg border border-transparent bg-transparent px-1.5 py-1 -mx-1.5 text-white outline-none placeholder:text-white/30 hover:border-white/[0.06] focus:border-white/15 focus:bg-black/20";
