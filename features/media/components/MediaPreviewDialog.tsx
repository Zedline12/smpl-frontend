"use client";

import { useState } from "react";
import { Copy, Download, Heart, Pencil, RefreshCw, Share2 } from "lucide-react";
import { format } from "date-fns";
import { Media, MediaDisplayVariant } from "@/features/media/types/media";
import { WaveformPlayer } from "@/features/artist/components/WaveformPlayer";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AiModelsEnum,
  AUDIO_MODELS,
  IMAGE_MODELS,
  STUDIO_MODELS,
  VIDEO_MODELS,
} from "@/features/generation/enums/models.enum";
import {
  useDownloadMedia,
  useRecreateMedia,
  useToggleLikeMutation,
} from "../hooks/useMediaActions";
import { copyText } from "../utils/media-actions";
import { ShareMenuItems } from "./actions/ShareMenuItems";
import { MENU_CONTENT_CLASS } from "./actions/MediaCardActions";

const ALL_MODELS = [
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...STUDIO_MODELS,
];

function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${formatKey(k)}: ${formatValue(v)}`)
      .join(" · ");
  }
  return String(value);
}

function ReferenceThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-xs text-blue-400 underline hover:text-blue-300"
      >
        {url}
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        src={url}
        alt="Reference"
        onError={() => setFailed(true)}
        className="h-20 w-20 rounded-lg border border-white/10 object-cover transition-opacity hover:opacity-80"
      />
    </a>
  );
}

interface MediaPreviewDialogProps {
  media: Media;
  open: boolean;
  onClose: () => void;
  onEditOpen?: () => void;
  /** Templates show only the media and a Recreate button. */
  template?: boolean;
  variant?: MediaDisplayVariant;
}

export function MediaPreviewDialog({
  media,
  open,
  onClose,
  onEditOpen,
  template = false,
  variant = "default",
}: MediaPreviewDialogProps) {
  const recreate = useRecreateMedia();
  const toggleLike = useToggleLikeMutation();
  const liked = !!media.liked;

  const modelInfo = ALL_MODELS.find((m) => m.id === media.model);
  const input = media.input ?? {};
  const prompt = typeof input.prompt === "string" ? input.prompt : "";

  // Split the remaining inputs into reference media and plain settings.
  const references: string[] = [];
  const settings: [string, unknown][] = [];
  Object.entries(input).forEach(([key, value]) => {
    if (key === "prompt") return;
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    if (typeof value === "object" && !Array.isArray(value) && !Object.keys(value).length) return;
    if (isUrl(value)) references.push(value);
    else if (Array.isArray(value) && value.every(isUrl)) references.push(...value);
    else settings.push([key, value]);
  });

  const download = useDownloadMedia();
  const handleDownload = () => download([media]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Edge to edge, above the navbar (z-[60]) and everything else. */}
      <DialogContent className="inset-0 top-0 left-0 z-[100] flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-neutral-950 p-0 sm:max-w-none sm:rounded-none md:flex-row data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
        <DialogTitle className="sr-only">Media details</DialogTitle>

        {/* Media — 70% (full width for templates) */}
        <div
          className={`relative flex min-h-[40vh] flex-1 items-center justify-center bg-black md:h-full ${
            template ? "md:w-full" : "md:w-[70%] md:flex-none"
          }`}
        >
          {media.type === "video" ? (
            <video
              src={media.url}
              controls
              autoPlay
              loop
              className="max-h-full max-w-full object-contain"
            />
          ) : media.type === "audio" && variant === "music" ? (
            <div className="w-full max-w-3xl p-6 md:p-10">
              <WaveformPlayer src={media.url} size="large" autoPlay />
            </div>
          ) : media.type === "audio" ? (
            <div className="flex w-full flex-col items-center gap-6 p-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-white/20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <audio src={media.url} controls autoPlay className="w-full max-w-md" />
            </div>
          ) : (
            <img
              src={media.url}
              alt="Generated media"
              className="max-h-full max-w-full object-contain"
            />
          )}

          {template && media.model && (
            <button
              type="button"
              onClick={() => {
                recreate(media);
                onClose();
              }}
              className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-8 py-3 text-base font-semibold text-white shadow-2xl shadow-black/60 transition-transform hover:scale-105"
              style={{ background: "var(--gradient-create)" }}
            >
              <RefreshCw className="size-5" /> Recreate
            </button>
          )}
        </div>

        {/* Details — 30% */}
        {!template && (
        <div className="flex min-h-0 flex-1 flex-col border-white/10 md:w-[30%] md:flex-none md:border-l">
          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pr-8">
              <div className="flex items-center gap-3">
                {modelInfo?.svg && (
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-lg">
                    {modelInfo.svg}
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {modelInfo?.name ?? media.model ?? "Upload"}
                  </p>
                  {media.createdAt && (
                    <p className="text-xs text-white/40">
                      {format(new Date(media.createdAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {media.model &&
              onEditOpen &&
              media.model !== AiModelsEnum.HIGGSFIELD_ADS_STUDIO && (
              <button
                type="button"
                onClick={onEditOpen}
                className="mt-3 flex items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
              >
                <Pencil className="size-3.5" /> Edit this result
              </button>
            )}

            {/* Prompt */}
            {prompt && (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] tracking-widest text-white/40 uppercase">
                    Prompt
                  </p>
                  <button
                    type="button"
                    onClick={() => copyText(prompt, "Prompt copied")}
                    title="Copy prompt"
                    className="text-white/40 transition-colors hover:text-white"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
                <p className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-sm leading-relaxed whitespace-pre-wrap text-white/85">
                  {prompt}
                </p>
              </div>
            )}

            {/* Settings */}
            {settings.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase">
                  Settings
                </p>
                <div className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/5 bg-white/[0.03]">
                  {settings.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-4 px-3 py-2"
                    >
                      <span className="shrink-0 text-xs text-white/45">
                        {formatKey(key)}
                      </span>
                      <span className="text-right text-xs break-words text-white/85">
                        {formatValue(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {references.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase">
                  References
                </p>
                <div className="flex flex-wrap gap-2">
                  {references.map((url, i) => (
                    <ReferenceThumb key={url + i} url={url} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 border-t border-white/10 px-6 py-5">
            {media.model && (
              <button
                type="button"
                onClick={() => {
                  recreate(media);
                  onClose();
                }}
                className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-create)" }}
              >
                <RefreshCw className="size-4" /> Recreate
              </button>
            )}
            <div className="flex items-center gap-3">
              <ActionCircle title="Download" onClick={handleDownload}>
                <Download className="size-4" />
              </ActionCircle>
              <ActionCircle
                title={liked ? "Unlike" : "Like"}
                onClick={() => toggleLike.mutate({ id: media.id, liked: !liked })}
              >
                <Heart
                  className={`size-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
                />
              </ActionCircle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" title="Share" className={circleClass}>
                    <Share2 className="size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="center"
                  className={MENU_CONTENT_CLASS}
                >
                  <ShareMenuItems url={media.url} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const circleClass =
  "flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10";

function ActionCircle({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" title={title} onClick={onClick} className={circleClass}>
      {children}
    </button>
  );
}
