"use client";
import { useState } from "react";
import {
  CheckSquare,
  Copy,
  Download,
  Heart,
  Link,
  Maximize2,
  MoreHorizontal,
  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Media } from "../../types/media";
import {
  useDownloadMedia,
  useRecreateMedia,
  useToggleLikeMutation,
} from "../../hooks/useMediaActions";
import { useMediaSelectionStore } from "../../stores/useMediaSelectionStore";
import { copyImage, copyText } from "../../utils/media-actions";
import { ShareMenuItems } from "./ShareMenuItems";
import { DeleteMediaDialog } from "./DeleteMediaDialog";

export const MENU_CONTENT_CLASS =
  "z-[110] min-w-48 border-white/10 bg-neutral-900/95 text-white backdrop-blur-md";

const roundButton =
  "flex size-8 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/75";

interface MediaCardActionsProps {
  media: Media;
  onOpen: () => void;
}

/** The top-right like / download / ⋯ stack on a media tile. */
export function MediaCardActions({ media, onOpen }: MediaCardActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const toggleLike = useToggleLikeMutation();
  const download = useDownloadMedia();
  const recreate = useRecreateMedia();
  const enterSelect = useMediaSelectionStore((s) => s.enter);
  const liked = !!media.liked;
  const isVideo = media.type === "video";
  const isImage = media.type === "image";

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <>
      <div
        onClick={stop}
        className={`absolute top-3 right-3 z-20 flex h-fit w-fit flex-col items-center gap-1.5 rounded-full bg-black/25 p-1 backdrop-blur-sm transition-all duration-200 ${
          menuOpen || deleteOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
        }`}
      >
        <button
          type="button"
          title={liked ? "Unlike" : "Like"}
          onClick={() => toggleLike.mutate({ id: media.id, liked: !liked })}
          className={roundButton}
        >
          <Heart
            className={`size-4 transition-transform active:scale-125 ${
              liked ? "fill-red-500 text-red-500" : ""
            }`}
          />
        </button>
        <button
          type="button"
          title="Download"
          onClick={() => download([media])}
          className={roundButton}
        >
          <Download className="size-4" />
        </button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button type="button" title="More" className={roundButton}>
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            className={MENU_CONTENT_CLASS}
            onClick={stop}
          >
            <DropdownMenuItem onSelect={onOpen}>
              <Maximize2 /> Open
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => enterSelect(media.id)}>
              <CheckSquare /> Select
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => recreate(media)}>
              <RefreshCw /> Recreate
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Share2 /> Share
              </DropdownMenuSubTrigger>
              {/* Portaled: the parent menu clips overflow, which cut the submenu off. */}
              <DropdownMenuPortal>
                <DropdownMenuSubContent
                  sideOffset={6}
                  className={MENU_CONTENT_CLASS}
                  onClick={stop}
                >
                  <ShareMenuItems url={media.url} />
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onSelect={() => download([media])}
            >
              <Download /> Download
            </DropdownMenuItem>
            {isImage && (
              <DropdownMenuItem onSelect={() => copyImage(media.url)}>
                <Copy /> Copy image
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onSelect={() => copyText(media.url, "URL copied")}
            >
              <Link /> {isVideo ? "Copy video URL" : isImage ? "Copy image URL" : "Copy URL"}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeleteOpen(true)}
              className="text-red-500 focus:text-red-500"
            >
              <Trash2 className="text-red-500" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Inside the wrapper so clicks in the (portaled) dialog don't reach the tile. */}
        <DeleteMediaDialog
          ids={[media.id]}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
      </div>
    </>
  );
}
