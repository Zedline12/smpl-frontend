"use client";

import { useState } from "react";
import {
  CreditsAllowance,
  useCreditsAllowance,
} from "@/features/subscribe/hooks/use-credits-allowance";

/** Share of the paid plan's monthly credits still left, 0–1 (0 without a plan). Pack credits aren't counted. */
export function remainingFraction({ remaining, allowance, hasAllowance }: CreditsAllowance): number {
  if (!hasAllowance || allowance <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / allowance));
}

/** `remainingFraction` for a user (the allowance comes from the plans list). */
export function useCreditsRemaining(user: any): number {
  return remainingFraction(useCreditsAllowance(user));
}

/** First + last name initials, just the first name's when there is no last name. */
export function userInitials(user: any): string {
  const first = user?.firstName?.trim()?.[0] ?? "";
  const last = user?.lastName?.trim()?.[0] ?? "";
  return (
    (first + last).toUpperCase() ||
    (user?.username?.[0] ?? user?.email?.[0] ?? "?").toUpperCase()
  );
}

/**
 * The user's avatar, falling back to their initials when there is no image or it fails to load.
 * With `progress`, a thin primary ring shows that fraction (full = all credits left).
 */
export function UserAvatar({
  user,
  size,
  progress,
  className,
}: {
  user: any;
  size: number;
  progress?: number;
  className?: string;
}) {
  const src: string | null | undefined = user?.avatarUrl;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const stroke = 2;
  const gap = progress === undefined ? 0 : 2;
  const outer = size + (stroke + gap) * 2;
  const r = (outer - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const showImage = !!src && failedSrc !== src;

  return (
    <div className={`relative shrink-0 ${className ?? ""}`} style={{ width: outer, height: outer }}>
      {progress !== undefined && (
        <svg width={outer} height={outer} className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx={outer / 2} cy={outer / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-white/15" />
          {progress > 0 && (
            <circle
              cx={outer / 2}
              cy={outer / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className="stroke-primary transition-[stroke-dashoffset] duration-500"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
            />
          )}
        </svg>
      )}
      <div
        className="absolute flex items-center justify-center overflow-hidden rounded-full font-bold text-white"
        style={{
          inset: stroke + gap,
          fontSize: Math.max(10, Math.round(size * 0.36)),
          background: showImage ? "#171717" : "linear-gradient(135deg, #6b41ff, #ea4bff)",
        }}
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img loading="lazy" decoding="async"
            src={src!}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setFailedSrc(src!)}
          />
        ) : (
          userInitials(user)
        )}
      </div>
    </div>
  );
}
