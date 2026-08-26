"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadFile } from "@/lib/handle-downloads";
import { VideoClip } from "../types";
import { formatClipDuration } from "../utils";
import { ViralScoreBadge } from "./ViralScoreBadge";

interface ClipPreviewDialogProps {
  clip: VideoClip | null;
  open: boolean;
  onClose: () => void;
}

export function ClipPreviewDialog({
  clip,
  open,
  onClose,
}: ClipPreviewDialogProps) {
  const transcriptRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);

  if (!clip) return null;

  const handleCopy = async () => {
    // navigator.clipboard needs a secure context — `next dev` binds 0.0.0.0, so
    // it is undefined when the app is opened over plain http on a LAN address.
    if (!navigator.clipboard?.writeText) {
      const node = transcriptRef.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      toast.info("Select the transcript and press Ctrl+C to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(clip.transcript);
      setCopied(true);
      toast.success("Transcript copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the transcript");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="bg-card border-border flex max-h-[90vh] w-full max-w-3xl flex-col gap-0 overflow-hidden rounded-2xl border p-0">
        <DialogTitle className="sr-only">
          {clip.title || "Clip preview"}
        </DialogTitle>

        <div className="flex max-h-[85vh] flex-col overflow-y-auto md:flex-row">
          <div className="flex items-center justify-center bg-black md:w-1/2">
            <video
              src={clip.videoUrl}
              controls
              autoPlay
              playsInline
              className="max-h-[60vh] w-full object-contain"
            />
          </div>

          <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-foreground text-base font-semibold">
                {clip.title || "Untitled clip"}
              </h2>
              <ViralScoreBadge score={clip.viralScore} />
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-[11px]">
              <span className="bg-muted rounded-full px-2 py-0.5">
                {formatClipDuration(clip.videoMsDuration)}
              </span>
              {clip.relatedTopic && (
                <span className="bg-muted rounded-full px-2 py-0.5">
                  {clip.relatedTopic}
                </span>
              )}
            </div>

            {clip.viralReason && (
              <div>
                <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-widest uppercase">
                  Why it works
                </p>
                <p className="text-foreground/85 text-sm leading-relaxed">
                  {clip.viralReason}
                </p>
              </div>
            )}

            {clip.transcript && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-muted-foreground text-[11px] font-semibold tracking-widest uppercase">
                    Transcript
                  </p>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 text-xs transition-colors"
                  >
                    {copied ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    Copy
                  </button>
                </div>
                <p
                  ref={transcriptRef}
                  className="text-foreground/85 text-sm leading-relaxed whitespace-pre-wrap"
                >
                  {clip.transcript}
                </p>
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    clip.videoUrl,
                    `${clip.title?.trim() || "clip"}.mp4`,
                  )
                }
                className="border-border hover:bg-background-light text-foreground flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              >
                <Download className="size-3.5" />
                Download
              </button>

              {clip.providerClipEditorUrl && (
                <a
                  href={clip.providerClipEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-primary flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
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
