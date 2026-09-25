"use client";

import { format } from "date-fns";
import { Check, Download, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFile } from "@/lib/handle-downloads";
import { cn } from "@/lib/utils";
import { BrandTheme, getThemeFonts } from "@/features/brand-themes/types";
import { MarketingStudioCreation } from "../types";

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4">
      <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}

function IncludeRow({ label, on }: { label: string; on: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        on
          ? "border-primary/40 bg-primary/15 text-white"
          : "border-white/10 text-white/35",
      )}
    >
      {on ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      {label}
    </span>
  );
}

interface CreationPreviewDialogProps {
  creation: MarketingStudioCreation;
  theme: BrandTheme | undefined;
  open: boolean;
  onClose: () => void;
}

export function CreationPreviewDialog({
  creation,
  theme,
  open,
  onClose,
}: CreationPreviewDialogProps) {
  const { media } = creation;
  if (!media) return null;

  const isVideo = creation.mediaType === "video";
  const input = (media.input ?? {}) as Record<string, unknown>;
  const duration =
    typeof input.durationSeconds === "number" ? input.durationSeconds : null;
  const audio =
    typeof input.generateAudio === "boolean" ? input.generateAudio : null;
  const referenceImages = Array.isArray(input.images)
    ? (input.images as unknown[]).filter(
        (item): item is string => typeof item === "string",
      )
    : [];
  const created = new Date(creation.createdAt);
  const fonts = getThemeFonts(theme);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-0">
        <DialogTitle className="sr-only">Creation details</DialogTitle>
        <DialogDescription className="sr-only">
          The generated {isVideo ? "ad" : "photo"} and the options it was made
          with.
        </DialogDescription>

        {/* Media */}
        <div className="relative flex max-h-[55vh] min-h-[180px] items-center justify-center overflow-hidden bg-black">
          {isVideo ? (
            <video
              src={media.url}
              controls
              autoPlay
              loop
              className="max-h-[55vh] max-w-full object-contain"
            />
          ) : (
            <img
              src={media.url}
              alt=""
              className="max-h-[55vh] max-w-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={() => downloadFile(media.url, media.id)}
            className="absolute top-3 left-3 cursor-pointer rounded-lg bg-black/40 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            title="Download"
          >
            <Download className="size-4" />
          </button>
        </div>

        {/* Details */}
        <div className="flex flex-col divide-y divide-white/5 overflow-y-auto">
          <Section label="Description">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/85">
              {creation.description}
            </p>
          </Section>

          {theme && (
            <Section label="Brand theme">
              <div className="flex items-center gap-3">
                {theme.logoUrl ? (
                  <img
                    src={theme.logoUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-lg border border-white/10 bg-white/5 object-contain p-1"
                  />
                ) : (
                  <span
                    className="size-10 shrink-0 rounded-lg border border-white/10"
                    style={{ background: theme.primaryColor ?? "transparent" }}
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {theme.name}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    {[theme.primaryColor, theme.secondaryColor]
                      .filter((color): color is string => !!color)
                      .map((color) => (
                        <span
                          key={color}
                          className="size-4 rounded-full border border-white/20"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                    {fonts.length > 0 && (
                      <span className="truncate text-xs text-white/40">
                        {fonts.join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          <Section label="Brand assets used">
            <div className="flex flex-wrap gap-2">
              <IncludeRow label="Logo" on={creation.includeLogo} />
              <IncludeRow label="Primary colour" on={creation.includePrimaryColor} />
              <IncludeRow label="Fonts" on={creation.includeFonts} />
            </div>
          </Section>

          <Section label="Settings">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[11px] text-white/40">Type</dt>
                <dd className="text-white/85">{isVideo ? "Video ad" : "Photo"}</dd>
              </div>
              <div>
                <dt className="text-[11px] text-white/40">Aspect ratio</dt>
                <dd className="text-white/85">{media.aspectRatio}</dd>
              </div>
              {duration !== null && (
                <div>
                  <dt className="text-[11px] text-white/40">Duration</dt>
                  <dd className="text-white/85">{duration}s</dd>
                </div>
              )}
              {audio !== null && (
                <div>
                  <dt className="text-[11px] text-white/40">Audio</dt>
                  <dd className="text-white/85">{audio ? "On" : "Off"}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] text-white/40">Model</dt>
                <dd className="truncate text-white/85">{media.model}</dd>
              </div>
              {!Number.isNaN(created.getTime()) && (
                <div>
                  <dt className="text-[11px] text-white/40">Created</dt>
                  <dd className="text-white/85">
                    {format(created, "MMM d, yyyy · h:mm a")}
                  </dd>
                </div>
              )}
            </dl>
          </Section>

          {referenceImages.length > 0 && (
            <Section label="Reference images">
              <div className="flex flex-wrap gap-2">
                {referenceImages.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={url}
                      alt="Reference"
                      className="size-16 rounded-lg border border-white/10 object-cover transition-opacity hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
