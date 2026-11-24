"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BroadcastButton, BroadcastDesign } from "../types";

const WIDTHS = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" } as const;

function Media({ media, className }: { media: NonNullable<BroadcastDesign["media"]>; className?: string }) {
  return media.kind === "video" ? (
    <video src={media.url} muted loop autoPlay playsInline className={cn("object-cover", className)} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={media.url} alt="" className={cn("object-cover", className)} />
  );
}

function Button({
  button,
  accent,
  textColor,
  onClick,
}: {
  button: BroadcastButton;
  accent: string;
  textColor: string;
  onClick: () => void;
}) {
  const base = "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-opacity hover:opacity-90";
  if (button.style === "link")
    return (
      <button type="button" onClick={onClick} className="h-11 px-2 text-sm font-semibold underline-offset-4 hover:underline" style={{ color: textColor }}>
        {button.label}
      </button>
    );
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(base, button.style === "secondary" && "border")}
      style={
        button.style === "primary"
          ? { background: accent, color: "#fff" }
          : { borderColor: `color-mix(in srgb, ${textColor} 30%, transparent)`, color: textColor, background: "transparent" }
      }
    >
      {button.label}
    </button>
  );
}

/**
 * The popup's look, shared by the real popup and the admin preview. Buttons call
 * onButton(index); the X calls onClose.
 */
export function BroadcastCard({
  design,
  onButton,
  onClose,
  className,
}: {
  design: BroadcastDesign;
  onButton: (index: number) => void;
  onClose: () => void;
  className?: string;
}) {
  const { layout, media, align, textColor } = design;
  const centered = align === "center";
  const bgLayout = layout === "background" && media;
  const sideLayout = layout === "image_left" && media;

  const content = (
    <div className={cn("relative flex flex-col gap-3 p-6 sm:p-7", centered ? "items-center text-center" : "items-start text-left", sideLayout && "flex-1 justify-center")}>
      {design.badge && (
        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase" style={{ background: design.accent, color: "#fff" }}>
          {design.badge}
        </span>
      )}
      <h2 className="text-2xl leading-tight font-extrabold sm:text-[28px]" style={{ color: textColor }}>
        {design.title}
      </h2>
      {design.body && (
        <p className="text-sm leading-relaxed whitespace-pre-line opacity-80" style={{ color: textColor }}>
          {design.body}
        </p>
      )}
      {design.buttons.length > 0 && (
        <div className={cn("mt-2 flex flex-wrap gap-2", centered && "justify-center")}>
          {design.buttons.map((b, i) => (
            <Button key={i} button={b} accent={design.accent} textColor={textColor} onClick={() => onButton(i)} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn("relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl", WIDTHS[design.size], className)}
      style={{ background: design.background }}
    >
      {bgLayout && (
        <>
          <Media media={media} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        </>
      )}

      {sideLayout ? (
        <div className="flex flex-col sm:flex-row">
          <Media media={media} className="aspect-video w-full sm:aspect-auto sm:w-2/5" />
          {content}
        </div>
      ) : (
        <div className={cn("relative", bgLayout && "flex min-h-[360px] flex-col justify-end")}>
          {layout === "image_top" && media && <Media media={media} className="aspect-video w-full" />}
          {content}
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
