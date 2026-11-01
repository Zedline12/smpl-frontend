"use client";

import Link from "next/link";
import {
  Sparkles,
  BarChart2,
  Cpu,
  Film,
  Asterisk,
  Wand2,
  Plus,
  CheckCircle2,
  Clock,
  ImageIcon,
  Zap,
  LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  BarChart: BarChart2,
  Cpu,
  Film,
  Asterisk,
  Wand: Wand2,
};

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  href: string;
}

// ─── small feature card ───────────────────────────────────────────────────────

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = ICON_MAP[item.icon] ?? Sparkles;

  const inner = (
    <div
      className="relative flex flex-col justify-between h-full min-h-[120px] p-4 rounded-[14px] border transition-all duration-200 group"
      style={
        item.highlighted
          ? {
              background:
                "linear-gradient(160deg, transparent 0%, rgba(107,65,255,0.18) 100%)",
              borderColor: "var(--purple-500)",
            }
          : {
              backgroundColor: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
            }
      }
      onMouseEnter={(e) => {
        if (!item.highlighted) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-elevated)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(107,65,255,0.4)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!item.highlighted) {
          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        }
      }}
    >
      {/* icon */}
      <Icon className="w-5 h-5 text-white opacity-80" />

      {/* bottom text */}
      <div className="flex flex-col gap-0.5 mt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-semibold text-foreground leading-tight">
            {item.title}
          </span>
          {item.badge && (
            <span
              className="text-[10px] font-bold italic uppercase px-1.5 py-0.5 rounded-[4px] leading-none"
              style={{
                backgroundColor: "var(--secondary)",
                color: "#0a0a0a",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2">
          {item.description}
        </p>
      </div>
    </div>
  );

  return item.href ? (
    <Link href={item.href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

// ─── large promo card ─────────────────────────────────────────────────────────

interface PromoCardProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  statusItems: { label: string; accent?: boolean }[];
  thumbUrls: string[];
}

function PromoCard({ title, subtitle, ctaLabel, ctaHref, statusItems, thumbUrls }: PromoCardProps) {
  return (
    <div
      className="flex flex-col gap-4 p-5 rounded-[16px] border h-full"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
    >
      {/* header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "var(--purple-500)" }} />
            <span
              className="text-[22px] font-extrabold uppercase text-foreground leading-none"
              style={{ letterSpacing: "-0.03em" }}
            >
              {title}
            </span>
          </div>
          <p className="text-[13px] text-muted-foreground">{subtitle}</p>
        </div>

        {/* CTA */}
        <Link
          href={ctaHref}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            backgroundColor: "var(--purple-500)",
            boxShadow: "0 4px 16px rgba(107,65,255,0.4)",
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {ctaLabel}
        </Link>
      </div>

      {/* inner status panel */}
      <div
        className="flex-1 rounded-[12px] p-3 flex gap-3 overflow-hidden"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        {/* status list */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          {statusItems.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {s.accent ? (
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--purple-500)" }} />
              ) : i === statusItems.length - 1 ? (
                <Clock className="w-3.5 h-3.5 flex-shrink-0 opacity-30" />
              ) : (
                <Zap className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
              )}
              <span
                className={`text-[12px] truncate ${s.accent ? "font-semibold" : "text-muted-foreground"} ${i === statusItems.length - 1 ? "opacity-30" : ""}`}
                style={s.accent ? { color: "var(--purple-300)" } : undefined}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* thumbnails */}
        {thumbUrls.length > 0 && (
          <div className="flex-shrink-0 flex items-end" style={{ height: 80 }}>
            {thumbUrls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-[8px] overflow-hidden border flex-shrink-0"
                style={{
                  borderColor: "var(--border-default)",
                  marginLeft: i > 0 ? -16 : 0,
                  transform: `rotate(${[-3, 2, -1][i]}deg)`,
                  zIndex: i,
                  position: "relative",
                }}
              >
                {url ? (
                  <img src={url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-elevated)" }}>
                    <ImageIcon className="w-5 h-5 opacity-20" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── grid ─────────────────────────────────────────────────────────────────────

interface FeatureGridProps {
  promo: PromoCardProps;
  features: FeatureItem[];
}

export function FeatureGrid({ promo, features }: FeatureGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
      {/* large promo — spans 1 col on mobile, 1 col on sm, 1 col of 4 on lg (rows 1–2) */}
      <div className="sm:col-span-1 lg:row-span-2 min-h-[260px]">
        <PromoCard {...promo} />
      </div>

      {/* 6 small cards — fill remaining 3 cols × 2 rows on lg */}
      {features.map((f, i) => (
        <div key={i} className="min-h-[120px]">
          <FeatureCard item={f} />
        </div>
      ))}
    </div>
  );
}
