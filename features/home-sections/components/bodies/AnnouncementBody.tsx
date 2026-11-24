"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnnouncementBody as Body, AnnouncementTone } from "../../types";
import { SmartLink } from "../SmartLink";

const TONES: Record<AnnouncementTone, string> = {
  purple: "border-[#6b41ff]/40 bg-gradient-to-r from-[#6b41ff]/25 via-[#6b41ff]/10 to-transparent text-white",
  lime: "border-[#d4ff00]/40 bg-[#d4ff00] text-[#0a0a0a]",
  neutral: "border-white/10 bg-white/[0.05] text-white",
  warning: "border-amber-400/40 bg-amber-400/15 text-amber-100",
};

const storageKey = (key: string) => `home-announcement-closed:${key}`;

/**
 * A slim strip, which viewers can close. Closing is remembered in this browser per
 * section version (`dismissKey`), so an edited announcement shows again.
 */
export function AnnouncementBody({ body, dismissKey }: { body: Body; dismissKey?: string }) {
  // Hidden until we know it wasn't closed (avoids a flash of a closed strip).
  const [closed, setClosed] = useState(!!(body.dismissible && dismissKey));

  useEffect(() => {
    if (!body.dismissible || !dismissKey) return;
    let wasClosed = false;
    try {
      wasClosed = localStorage.getItem(storageKey(dismissKey)) === "1";
    } catch {
      // Storage blocked: always show.
    }
    const t = setTimeout(() => setClosed(wasClosed), 0);
    return () => clearTimeout(t);
  }, [body.dismissible, dismissKey]);

  if (closed) return null;

  const close = () => {
    setClosed(true);
    if (!dismissKey) return;
    try {
      localStorage.setItem(storageKey(dismissKey), "1");
    } catch {
      // Closed for this visit only.
    }
  };

  return (
    <div className={cn("flex items-center gap-3 rounded-xl border px-4 py-2.5 text-sm", TONES[body.tone] ?? TONES.purple)}>
      <Megaphone className="size-4 shrink-0 opacity-80" />
      <p className="min-w-0 flex-1 font-medium">{body.text}</p>
      {body.cta && (
        <SmartLink
          href={body.cta.href}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-black/20 px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-black/30"
        >
          {body.cta.label} <ArrowRight className="size-3.5" />
        </SmartLink>
      )}
      {body.dismissible && (
        <button type="button" onClick={close} aria-label="Close" className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100">
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
