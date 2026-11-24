"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CloudUpload, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
  UploadCancelledError,
  applyUploadEdit,
  uploadWithProgress,
  type UploadEdit,
} from "@/features/media/api/upload";
import { UploadEditor } from "@/features/media/components/upload-editor/UploadEditor";
import { cropImageFile } from "@/features/media/utils/crop-image";

type MediaItem = { id: string; url: string; type?: string; liked?: boolean };
/** An upload in progress: the file goes up first, then (if edited) ffmpeg runs on it. */
type UploadState = { phase: "uploading" | "processing"; progress: number; edited: boolean };
type ActiveTab = "uploads" | "ai-influencer" | "generations" | "liked";

const TABS: { value: ActiveTab; label: string; special?: boolean }[] = [
  { value: "uploads", label: "Uploads" },
  { value: "ai-influencer", label: "AI Influencer", special: true },
  { value: "generations", label: "Generations" },
  { value: "liked", label: "Liked" },
];

const validateVideoDuration = (file: File, minDuration: number): Promise<boolean> =>
  new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration >= minDuration);
    };
    video.onerror = () => resolve(false);
    video.src = URL.createObjectURL(file);
  });

interface MediaManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage?: string;
  selectedImages?: string[];
  onSelect: (urls: string[]) => void;
  mediaType?: "image" | "video";
  maxSelections?: number;
}

export function MediaManagerDialog({
  open,
  onOpenChange,
  selectedImage,
  selectedImages,
  onSelect,
  mediaType = "image",
  maxSelections = 5,
}: MediaManagerDialogProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("uploads");
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [aiInfluencerMedia, setAiInfluencerMedia] = useState<MediaItem[]>([]);
  const [isLoadingAiInfluencer, setIsLoadingAiInfluencer] = useState(false);
  const [generationsMedia, setGenerationsMedia] = useState<MediaItem[]>([]);
  const [isLoadingGenerations, setIsLoadingGenerations] = useState(false);
  const [upload, setUpload] = useState<UploadState | null>(null);
  /** A picked file waiting in the editor (reframe / cut) before it's uploaded. */
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAbort = useRef<AbortController | null>(null);
  const isUploading = upload !== null;

  // Closing the dialog drops the editor, but an upload keeps going in the background:
  // reopening shows its progress, and when it finishes it's selected as usual.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setPendingFile(null);
  }, [open]);

  useEffect(() => {
    if (open) {
      const initial = maxSelections > 1 ? (selectedImages ?? []) : [selectedImage ?? ""];
      setTempSelection(initial.filter(Boolean));
      setActiveTab("uploads");
      fetchLibrary();
      // Reset other tabs so they re-fetch fresh
      setAiInfluencerMedia([]);
      setGenerationsMedia([]);
    }
  }, [open]);

  // ─── Data fetching ────────────────────────────────────────────────────────────

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch(`/api/media/reference-${mediaType}s`);
      const json = await res.json();
      setLibraryImages(json.data || []);
    } catch {
      toast.error("Failed to load library");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const fetchAiInfluencer = async () => {
    setIsLoadingAiInfluencer(true);
    try {
      const res = await fetch(
        "/api/media/me?model=smpl-ai-influencer&type=image&limit=50",
      );
      const json = await res.json();
      setAiInfluencerMedia(json.data?.data ?? []);
    } catch {
      toast.error("Failed to load AI Influencer images");
    } finally {
      setIsLoadingAiInfluencer(false);
    }
  };

  const fetchGenerations = async () => {
    setIsLoadingGenerations(true);
    try {
      const params = new URLSearchParams({ type: mediaType, limit: "50" });
      const res = await fetch(`/api/media/me?${params}`);
      const json = await res.json();
      setGenerationsMedia(json.data?.data ?? []);
    } catch {
      toast.error("Failed to load generations");
    } finally {
      setIsLoadingGenerations(false);
    }
  };

  const likedMedia = generationsMedia.filter((m) => m.liked);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "ai-influencer" && aiInfluencerMedia.length === 0) fetchAiInfluencer();
    if ((tab === "generations" || tab === "liked") && generationsMedia.length === 0)
      fetchGenerations();
  };

  // ─── Upload / delete ──────────────────────────────────────────────────────────

  /** Checks a picked / dropped file, then opens the editor for it. */
  const pickFile = async (file: File) => {
    const prefix = mediaType === "video" ? "video/" : "image/";
    if (!file.type.startsWith(prefix)) {
      toast.error(`Please choose a ${mediaType} file`);
      return;
    }
    if (mediaType === "video" && !(await validateVideoDuration(file, 3))) {
      toast.error("Video must be at least 3 seconds long");
      return;
    }
    setPendingFile(file);
  };

  const single = maxSelections === 1;

  /** Picking is the choice: one-pick dialogs return it and close right away. */
  const choose = (next: string[]) => {
    setTempSelection(next);
    if (single && next.length) {
      onSelect(next);
      onOpenChange(false);
    }
  };

  /** Multi-pick dialogs hand back what's ticked when they close. No confirm button. */
  const close = () => {
    if (!single) onSelect(tempSelection.filter(Boolean));
    onOpenChange(false);
  };

  const selectUploaded = (url: string) => {
    if (single) return choose([url]);
    if (tempSelection.includes(url) || tempSelection.length >= maxSelections) return;
    choose([...tempSelection, url]);
  };

  /**
   * Uploads with progress. Image crops happen in the browser first, so only the crop
   * goes up; video cuts (and image crops the browser can't do) upload the original
   * as a temporary source and run with ffmpeg on our backend.
   */
  const uploadFile = async (file: File, requested: UploadEdit | null) => {
    setPendingFile(null);
    setActiveTab("uploads");
    const controller = new AbortController();
    uploadAbort.current = controller;
    let edit = requested;
    let toUpload = file;
    try {
      if (edit?.type === "image") {
        setUpload({ phase: "processing", progress: 0, edited: true });
        try {
          toUpload = await cropImageFile(file, edit.crop);
          edit = null; // already cropped
        } catch {
          // Too big for this browser's canvas: crop on the backend instead.
        }
        if (controller.signal.aborted) return;
      }
      setUpload({ phase: "uploading", progress: 0, edited: !!requested });
      let url = await uploadWithProgress(toUpload, {
        purpose: edit ? "media-edit-source" : undefined,
        signal: controller.signal,
        onProgress: (fraction) =>
          setUpload((u) => (u ? { ...u, progress: fraction } : u)),
      });
      if (edit) {
        setUpload((u) => (u ? { ...u, phase: "processing", progress: 1 } : u));
        url = await applyUploadEdit(url, edit);
      }
      if (controller.signal.aborted) return;
      toast.success(
        !requested
          ? "Uploaded successfully"
          : requested.type === "image"
            ? "Image cropped and uploaded"
            : "Video cut and uploaded",
      );
      selectUploaded(url);
      await fetchLibrary();
    } catch (err) {
      if (err instanceof UploadCancelledError || controller.signal.aborted) return;
      toast.error(err instanceof Error && err.message ? err.message : "Failed to upload");
    } finally {
      if (uploadAbort.current === controller) uploadAbort.current = null;
      setUpload(null);
    }
  };

  const deleteMedia = async (imageUrl: string) => {
    try {
      const res = await fetch(`/api/media/reference-${mediaType}s`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (!res.ok) throw new Error();
      setTempSelection((prev) => prev.filter((u) => u !== imageUrl));
      await fetchLibrary();
    } catch {
      toast.error("Failed to delete media");
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || isUploading) return;
    await pickFile(file);
  };

  const toggleSelection = (url: string) => {
    if (single) return choose([url]);
    if (tempSelection.includes(url)) return choose(tempSelection.filter((item) => item !== url));
    if (tempSelection.length >= maxSelections) return;
    choose([...tempSelection, url]);
  };

  // ─── Shared card renderer ─────────────────────────────────────────────────────

  const renderCard = (url: string, onDelete?: () => void) => {
    const selected = tempSelection.includes(url);
    const isVideo = url.match(/\.(mp4|webm|mov|mkv)$/i) || mediaType === "video";
    return (
      <div
        key={url}
        onClick={() => toggleSelection(url)}
        className={cn(
          "relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all",
          selected ? "ring-2 ring-white" : "ring-1 ring-transparent hover:ring-white/20",
        )}
      >
        {isVideo ? (
          <video preload="metadata"
            src={url}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            onMouseOver={(e) => e.currentTarget.play().catch(() => {})}
            onMouseOut={(e) => e.currentTarget.pause()}
          />
        ) : (
          <img loading="lazy" decoding="async" src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow">
            <Check className="w-3 h-3 text-black stroke-[3px]" />
          </div>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute bottom-2 right-2 z-10 bg-black/60 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="w-3 h-3 text-white" />
          </button>
        )}
      </div>
    );
  };

  const renderMediaCards = (items: MediaItem[]) =>
    items.map((item) => renderCard(item.url));

  // ─── Skeleton ────────────────────────────────────────────────────────────────

  const skeletons = Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
  ));

  // ─── Render ───────────────────────────────────────────────────────────────────

  const selectionCount = tempSelection.filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-[860px] w-full p-0 gap-0 border-0 bg-transparent shadow-none [&>button]:hidden">
        <div
          className="relative flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            maxHeight: "90vh",
          }}
        >
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {pendingFile ? (
            <UploadEditor
              file={pendingFile}
              mediaType={mediaType}
              onBack={() => setPendingFile(null)}
              onUpload={(edit) => uploadFile(pendingFile, edit)}
            />
          ) : (
          <>
          {/* Tab bar */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 pr-16 flex-shrink-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-white text-black"
                      : tab.special
                      ? "text-[#9370ff] hover:text-white bg-transparent"
                      : "text-[#8a8a8a] hover:text-white bg-transparent",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          {/* Divider under the tabs and the close button */}
          <div className="h-px w-full bg-white/20 flex-shrink-0" />

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-5 pt-5 pb-5"
            style={{ minHeight: 0 }}
            onDragOver={activeTab === "uploads" ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
            onDragLeave={activeTab === "uploads" ? () => setIsDragging(false) : undefined}
            onDrop={activeTab === "uploads" ? handleFileDrop : undefined}
          >
            {/* UPLOADS */}
            {activeTab === "uploads" && (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                {/* Upload tile */}
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={cn(
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-2 transition-colors",
                    isUploading ? "cursor-default" : "cursor-pointer",
                    isDragging
                      ? "border-2 border-dashed border-white/40 bg-white/5"
                      : "border border-dashed border-[#3a3a3a] bg-[#222] hover:border-white/20",
                  )}
                >
                  {upload ? (
                    <div className="w-full px-4 flex flex-col items-center gap-2" aria-live="polite">
                      {upload.phase === "uploading" ? (
                        <>
                          <span className="text-[20px] font-semibold text-white tabular-nums">
                            {Math.round(upload.progress * 100)}%
                          </span>
                          <Progress value={Math.round(upload.progress * 100)} aria-label="Upload progress" />
                          <span className="text-[12px] text-[#8a8a8a]">Uploading…</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              uploadAbort.current?.abort();
                            }}
                            className="text-[12px] font-medium text-[#b5b5b5] hover:text-white underline-offset-2 hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-6 h-6 text-white/70 animate-spin" />
                          <span className="text-[13px] font-medium text-white">Processing…</span>
                          <span className="text-[12px] text-[#8a8a8a] text-center">
                            {mediaType === "video" ? "Cutting your video" : "Cropping your image"}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      >
                        <CloudUpload className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[13px] font-semibold text-white">Upload media</span>
                    </>
                  )}
                </div>

                {/* Library items */}
                {isLoadingLibrary
                  ? skeletons
                  : libraryImages.map((url) => renderCard(url, () => deleteMedia(url)))}
              </div>
            )}

            {/* AI INFLUENCER */}
            {activeTab === "ai-influencer" && (
              isLoadingAiInfluencer ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {skeletons}
                </div>
              ) : aiInfluencerMedia.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[#8a8a8a] text-sm">
                  No AI Influencer images yet
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {renderMediaCards(aiInfluencerMedia)}
                </div>
              )
            )}

            {/* GENERATIONS */}
            {activeTab === "generations" && (
              isLoadingGenerations ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {skeletons}
                </div>
              ) : generationsMedia.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[#8a8a8a] text-sm">
                  No generations yet
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {renderMediaCards(generationsMedia)}
                </div>
              )
            )}

            {/* LIKED */}
            {activeTab === "liked" && (
              isLoadingGenerations ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {skeletons}
                </div>
              ) : likedMedia.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-[#8a8a8a] text-sm">
                  No liked items yet
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(144px,1fr))] gap-4">
                  {renderMediaCards(likedMedia)}
                </div>
              )
            )}
          </div>

          {/* Multi-pick: just the count (what's ticked is used when the dialog closes) */}
          {!single && (
            <div
              className="flex items-center px-5 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-[13px] text-[#8a8a8a]">
                {selectionCount} of {maxSelections} selected
              </span>
            </div>
          )}
          </>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={mediaType === "video" ? "video/*" : "image/*"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pickFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
