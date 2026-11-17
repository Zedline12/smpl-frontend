"use client";
import type { ReactNode } from "react";

/** Page shell for the Ads Studio library pages (Products, Avatars, All media). */
export function LibraryPage({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-5 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/55">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export const primaryButton =
  "bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export const ghostButton =
  "flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-40";

export const fieldClass =
  "h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30";

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.05] text-white/60">
        {icon}
      </span>
      <p className="font-semibold text-white">{title}</p>
      <p className="max-w-sm text-sm text-white/50">{text}</p>
      {action}
    </div>
  );
}
