import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Panel and tile backgrounds: a step lighter than the app background. */
export const PANEL_BG = "rgba(255,255,255,0.045)";
export const TILE_BG = "rgba(255,255,255,0.04)";

/** Page title and subtitle on the left, actions on the right. */
export function SettingsHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** A rounded section with a small icon + title row and an optional action. */
export function SettingsPanel({
  icon: Icon,
  title,
  action,
  children,
  className,
}: {
  icon?: LucideIcon;
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("rounded-2xl border border-white/[0.06] p-2", className)}
      style={{ background: PANEL_BG }}
    >
      {(title || action) && (
        <div className="flex min-h-9 items-center justify-between gap-3 px-2.5 pt-1 pb-2">
          <p className="flex items-center gap-2 text-sm text-white/60">
            {Icon && <Icon className="size-4" />}
            {title}
          </p>
          {action}
        </div>
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

/** An inner block inside a panel. */
export function SettingsTile({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl p-4", className)} style={{ background: TILE_BG }}>
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  text,
}: {
  icon?: LucideIcon;
  title: string;
  text?: string;
}) {
  return (
    <SettingsTile className="flex min-h-40 flex-col items-center justify-center gap-1.5 py-12 text-center">
      <Icon className="mb-1 size-6 text-white/50" />
      <p className="text-sm font-semibold text-white/70">{title}</p>
      {text && <p className="text-xs text-white/40">{text}</p>}
    </SettingsTile>
  );
}

/** A coloured square behind an icon (nav items, stat tiles). */
export function IconSquare({
  icon: Icon,
  color,
  className,
}: {
  icon: LucideIcon;
  /** Solid colour; omit for a neutral square. */
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md",
        color ? "text-white" : "bg-white/[0.06] text-white/60",
        className,
      )}
      style={color ? { background: color } : undefined}
    >
      <Icon className="size-4" />
    </span>
  );
}
