"use client";

import { Media } from "@/features/media/types/media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAiGenerationControlStore, useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { downloadFile } from "@/lib/handle-downloads";
import { useState } from "react";

function UrlValue({ url }: { url: string }) {
  const [imageError, setImageError] = useState(false);
  if (imageError) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="text-blue-400 hover:text-blue-300 text-sm break-all underline">
        {url}
      </a>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img src={url} alt="Reference"
        className="max-h-48 rounded-lg object-contain cursor-pointer hover:opacity-80 transition-opacity"
        onError={() => setImageError(true)}
      />
    </a>
  );
}

function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch { return false; }
}

function formatKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim().replace(/^\w/, (c) => c.toUpperCase());
}

interface MediaPreviewDialogProps {
  media: Media;
  open: boolean;
  onClose: () => void;
  onEditOpen: () => void;
}

export function MediaPreviewDialog({ media, open, onClose, onEditOpen }: MediaPreviewDialogProps) {
  const { setModel, setMediaType } = useAiGenerationControlStore();
  const { setField } = useAiModelStore();

  const handleRegenerate = () => {
    const modelEnum = media.model as AiModelsEnum;
    setMediaType(media.type as GenerationTypeEnum);
    setModel(modelEnum);
    Object.entries(media.input).forEach(([key, value]) => {
      setField(modelEnum, key, value);
    });
    onClose();
  };

  const inputEntries = Object.entries(media.input ?? {}).filter(
    ([, value]) => value !== null && value !== undefined && value !== ""
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0">
        <DialogTitle className="sr-only">Media Preview</DialogTitle>

        {/* Media preview */}
        <div className="relative bg-black flex items-center justify-center min-h-[180px] max-h-[55vh] overflow-hidden">
          {media.type === "video" ? (
            <video src={media.url} controls autoPlay loop className="max-w-full max-h-[55vh] object-contain" />
          ) : media.type === "audio" ? (
            <div className="p-10 flex flex-col items-center gap-6 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <audio src={media.url} controls autoPlay className="w-full max-w-sm" />
            </div>
          ) : (
            <img src={media.url} alt="Full view" className="max-w-full max-h-[55vh] object-contain" />
          )}

          <button
            onClick={() => downloadFile(media.url, media.id)}
            className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-lg hover:bg-black/60 transition-colors text-white"
            title="Download"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="overflow-y-auto flex flex-col divide-y divide-white/5">
          {/* Model */}
          <div className="px-6 py-4">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Model</p>
            <p className="text-white/90 text-sm font-medium">{media.model}</p>
          </div>

          {/* Input metadata */}
          {inputEntries.length > 0 && (
            <div className="px-6 py-4">
              <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">Input</p>
              <div className="flex flex-col gap-4">
                {inputEntries.map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[11px] text-white/40 mb-1.5">{formatKey(key)}</p>
                    {isUrl(value) ? (
                      <UrlValue url={String(value)} />
                    ) : (
                      <p className="text-white/80 text-sm leading-relaxed">{String(value)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-4 flex gap-3">
            <button
              onClick={handleRegenerate}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90 transition-opacity"
            >
              Regenerate
            </button>
            <button
              onClick={onEditOpen}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white/80 border border-white/15 hover:bg-white/5 hover:text-white transition-all"
            >
              Edit
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
