"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Bookmark, Check, Copy, Download, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { downloadFile } from "@/lib/handle-downloads";
import { cn } from "@/lib/utils";
import { useRegenerateClipCopyMutation, useSaveClipsMutation } from "../hooks/use-clipping";
import { VideoClip } from "../types";
import { formatClipDuration } from "../utils";
import { ClippingPlatformId, PLATFORM_BY_ID, PlatformIcon } from "../platforms";
import { ViralScoreBadge } from "./ViralScoreBadge";

interface ClipPreviewDialogProps {
  projectId: string;
  clip: VideoClip | null;
  /** Platforms the clip is for (post copy tabs). */
  platforms: string[];
  open: boolean;
  onClose: () => void;
}

/** Copies text, with a fallback for non-secure contexts (plain http on a LAN). */
async function copyText(text: string, what: string) {
  if (!navigator.clipboard?.writeText) {
    toast.info(`Select the ${what} and press Ctrl+C to copy.`);
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what[0].toUpperCase()}${what.slice(1)} copied`);
    return true;
  } catch {
    toast.error(`Could not copy the ${what}`);
    return false;
  }
}

function CopyButton({ text, what }: { text: string; what: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        if (await copyText(text, what)) {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        }
      }}
      className="text-white/60 hover:text-white flex cursor-pointer items-center gap-1 text-xs transition-colors"
    >
      {done ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      Copy
    </button>
  );
}

function PostCopySection({ projectId, clip, platforms }: { projectId: string; clip: VideoClip; platforms: string[] }) {
  const ids = platforms.filter((p) => p in PLATFORM_BY_ID) as ClippingPlatformId[];
  const [tab, setTab] = useState<ClippingPlatformId | null>(ids[0] ?? null);
  const regen = useRegenerateClipCopyMutation(projectId);
  if (!ids.length || !tab) return null;

  const rules = PLATFORM_BY_ID[tab];
  const copy = clip.postCopy?.[tab];
  const tags = copy?.hashtags?.join(" ") ?? "";
  const full = [copy?.caption, tags].filter(Boolean).join(rules.hashtagsInCaption ? " " : "\n\n");
  const used = rules.hashtagsInCaption ? full.length : (copy?.caption?.length ?? 0);

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-white/60 text-[11px] font-semibold tracking-widest uppercase">Post copy</p>
        <button
          type="button"
          onClick={() => regen.mutate(clip.providerVideoId)}
          disabled={regen.isPending}
          className="text-white/60 hover:text-white flex items-center gap-1 text-xs transition-colors disabled:opacity-50"
        >
          {regen.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          {copy ? "Rewrite" : "Write captions"}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
              tab === id ? "bg-white text-black" : "bg-white/[0.06] text-white/65 hover:text-white",
            )}
          >
            <PlatformIcon id={id} className="size-3" />
            {PLATFORM_BY_ID[id].short}
          </button>
        ))}
      </div>

      {copy ? (
        <div className="flex flex-col gap-3">
          {rules.titleMax > 0 && copy.title && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] text-white/45">
                  Title · {copy.title.length}/{rules.titleMax}
                </span>
                <CopyButton text={copy.title} what="title" />
              </div>
              <p className="text-sm text-white/90">{copy.title}</p>
            </div>
          )}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className={cn("text-[11px]", used > rules.captionMax ? "text-red-400" : "text-white/45")}>
                Caption · {used}/{rules.captionMax}
              </span>
              <CopyButton text={full} what="caption" />
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">{copy.caption}</p>
            {tags && <p className="mt-1.5 text-sm text-sky-300/90">{tags}</p>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-white/45">No captions yet for {rules.label}. Click “Write captions”.</p>
      )}
    </div>
  );
}

export function ClipPreviewDialog({ projectId, clip, platforms, open, onClose }: ClipPreviewDialogProps) {
  const save = useSaveClipsMutation(projectId);
  if (!clip) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="bg-card border-border flex max-h-[90vh] w-full max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogTitle className="sr-only">{clip.title || "Clip preview"}</DialogTitle>

        <div className="flex max-h-[85vh] flex-col overflow-y-auto md:flex-row">
          <div className="flex items-center justify-center bg-black md:w-[45%]">
            <video src={clip.videoUrl} controls autoPlay playsInline className="max-h-[70vh] w-full object-contain" />
          </div>

          <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-white text-base font-semibold">{clip.title || "Untitled clip"}</h2>
              <ViralScoreBadge score={clip.viralScore} />
            </div>

            <div className="text-white/60 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="bg-muted rounded-full px-2 py-0.5">{formatClipDuration(clip.videoMsDuration)}</span>
              {clip.relatedTopic && <span className="bg-muted rounded-full px-2 py-0.5">{clip.relatedTopic}</span>}
            </div>

            {clip.viralReason && (
              <div>
                <p className="text-white/60 mb-1 text-[11px] font-semibold tracking-widest uppercase">Why it works</p>
                <p className="text-white/85 text-sm leading-relaxed">{clip.viralReason}</p>
              </div>
            )}

            <PostCopySection key={clip.providerVideoId} projectId={projectId} clip={clip} platforms={platforms} />

            {clip.transcript && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-white/60 text-[11px] font-semibold tracking-widest uppercase">Transcript</p>
                  <CopyButton text={clip.transcript} what="transcript" />
                </div>
                <p className="text-white/85 max-h-40 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                  {clip.transcript}
                </p>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => downloadFile(clip.videoUrl, `${clip.title?.trim() || "clip"}.mp4`)}
                className="border-border hover:bg-background-light text-white flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Download className="size-3.5" />
                Download
              </button>
              <button
                type="button"
                disabled={!!clip.savedMediaId || save.isPending}
                onClick={() => save.mutate([clip.providerVideoId])}
                className="border-border hover:bg-background-light text-white flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-default disabled:opacity-60"
              >
                {save.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Bookmark className={cn("size-3.5", clip.savedMediaId && "fill-white")} />
                )}
                {clip.savedMediaId ? "In your library" : "Save to library"}
              </button>

              {clip.providerClipEditorUrl && (
                <a
                  href={clip.providerClipEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
                >
                  <ExternalLink className="size-3.5" />
                  Open in editor
                </a>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
