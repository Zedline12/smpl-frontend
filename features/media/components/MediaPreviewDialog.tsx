"use client";

import { Download, Heart, Pencil, RefreshCw, Share2 } from "lucide-react";
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
import { ShareMenuItems } from "./actions/ShareMenuItems";
import { MENU_CONTENT_CLASS } from "./actions/MediaCardActions";
import { MediaParams } from "./MediaParams";

const ALL_MODELS = [
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
  ...STUDIO_MODELS,
];

interface MediaPreviewDialogProps {
  media: Media;
  open: boolean;
  onClose: () => void;
  onEditOpen?: () => void;
  /** Templates: 75/25 split, the params used and only a Recreate action. */
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
  const download = useDownloadMedia();
  const liked = !!media.liked;
  const modelInfo = ALL_MODELS.find((m) => m.id === media.model);

  const handleRecreate = () => {
    recreate(media);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* Edge to edge, above the navbar (z-[60]) and everything else. */}
      <DialogContent className="inset-0 top-0 left-0 z-[100] flex h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-neutral-950 p-0 sm:max-w-none sm:rounded-none md:flex-row data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100">
        <DialogTitle className="sr-only">Media details</DialogTitle>

        {/* Media: 75% for templates, 70% otherwise */}
        <div
          className={`relative flex min-h-[40vh] flex-1 items-center justify-center bg-black md:h-full md:flex-none ${
            template ? "md:w-[75%]" : "md:w-[70%]"
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
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.url}
              alt="Generated media"
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>

        {/* Details: 25% for templates, 30% otherwise */}
        <div
          className={`flex min-h-0 flex-1 flex-col border-white/10 md:flex-none md:border-l ${
            template ? "md:w-[25%]" : "md:w-[30%]"
          }`}
        >
          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 pt-6 pb-4">
            {/* Header */}
            <div className="flex items-center gap-3 pr-8">
              {modelInfo?.svg && (
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-lg">
                  {modelInfo.svg}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-white">
                  {modelInfo?.name ?? media.model ?? "Upload"}
                </p>
                {template ? (
                  <p className="text-xs text-white/40">Template</p>
                ) : (
                  media.createdAt && (
                    <p className="text-xs text-white/40">
                      {format(new Date(media.createdAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  )
                )}
              </div>
            </div>
            {!template &&
              media.model &&
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

            <MediaParams media={media} />
          </div>

          {/* Actions */}
          {template ? (
            media.model && (
              <div className="border-t border-white/10 px-6 py-5">
                <button
                  type="button"
                  onClick={handleRecreate}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <RefreshCw className="size-4" /> Recreate
                </button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-4 border-t border-white/10 px-6 py-5">
              {media.model && (
                <button
                  type="button"
                  onClick={handleRecreate}
                  className="flex w-full max-w-xs items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: "var(--gradient-create)" }}
                >
                  <RefreshCw className="size-4" /> Recreate
                </button>
              )}
              <div className="flex items-center gap-3">
                <ActionCircle title="Download" onClick={() => download([media])}>
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
          )}
        </div>
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
