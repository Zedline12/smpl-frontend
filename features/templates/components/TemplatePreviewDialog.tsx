"use client";

import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MediaParams } from "@/features/media/components/MediaParams";
import { useRecreateMedia } from "@/features/media/hooks/useMediaActions";
import { Template } from "../types";
import { templateAsMedia } from "../recreate";
import { TemplateMedia } from "./TemplateMedia";

/** Big view of a template with its settings and Recreate. */
export function TemplatePreviewDialog({
  template,
  onClose,
}: {
  template: Template | null;
  onClose: () => void;
}) {
  const recreate = useRecreateMedia();
  if (!template) return null;
  const media = templateAsMedia(template);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card border-border w-[calc(100%-2rem)] max-w-5xl overflow-hidden rounded-2xl border p-0 sm:max-w-5xl">
        <DialogTitle className="sr-only">Template</DialogTitle>
        <div className="grid max-h-[85vh] grid-cols-1 md:grid-cols-[3fr_1fr]">
          <div className="relative aspect-video bg-black md:aspect-auto md:min-h-[480px]">
            <TemplateMedia template={template} />
          </div>
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
            <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">Template</p>
            <MediaParams media={media} />
            <button
              type="button"
              onClick={() => {
                recreate(media);
                onClose();
              }}
              className="mt-auto flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--gradient-create)" }}
            >
              <Sparkles className="size-4" /> Recreate
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
