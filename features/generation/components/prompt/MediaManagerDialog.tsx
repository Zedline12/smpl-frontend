"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CloudUpload, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MediaItem = { id: string; url: string; type?: string; liked?: boolean };
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
  const [isUploading, setIsUploading] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        "/api/media/me?model=higgsfield-ai-influencer&type=image&limit=50",
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

  const uploadImage = async (file: File) => {
    if (mediaType === "video") {
      const isValid = await validateVideoDuration(file, 3);
      if (!isValid) {
        toast.error("Video must be at least 3 seconds long");
        return;
      }
    }
    setIsUploading(true);
    try {
      const previousUrls = new Set(libraryImages);
      const sigRes = await fetch("/api/media/upload-signature", {
        method: "POST",
        body: JSON.stringify({ contentType: file.type }),
        headers: { "Content-Type": "application/json" },
      });
      const { data: { url } } = await sigRes.json();
      await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      toast.success("Uploaded successfully");
      const newRes = await fetch(`/api/media/reference-${mediaType}s`);
      const newJson = await newRes.json();
      const newUrls: string[] = newJson.data || [];
      setLibraryImages(newUrls);
      const newItem = newUrls.find((u) => !previousUrls.has(u));
      if (newItem) {
        setTempSelection((prev) => {
          if (maxSelections === 1) return [newItem];
          if (prev.includes(newItem) || prev.length >= maxSelections) return prev;
          return [...prev, newItem];
        });
      }
      setActiveTab("uploads");
    } catch {
      toast.error("Failed to upload");
    } finally {
      setIsUploading(false);
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
    if (!file) return;
    const prefix = mediaType === "video" ? "video/" : "image/";
    if (!file.type.startsWith(prefix)) {
      toast.error(`Please drop a ${mediaType} file`);
      return;
    }
    if (mediaType === "video") {
      const isValid = await validateVideoDuration(file, 3);
      if (!isValid) {
        toast.error("Video must be at least 3 seconds long");
        return;
      }
    }
    uploadImage(file);
  };

  const toggleSelection = (url: string) => {
    setTempSelection((prev) => {
      if (prev.includes(url)) return prev.filter((item) => item !== url);
      if (prev.length >= maxSelections) return maxSelections === 1 ? [url] : prev;
      return [...prev, url];
    });
  };

  const handleConfirm = () => {
    onSelect(tempSelection.filter(Boolean));
    onOpenChange(false);
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
          <video
            src={url}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => e.currentTarget.pause()}
          />
        ) : (
          <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Tab bar */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
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

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto px-5 pb-5"
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
                    "aspect-square rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
                    isDragging
                      ? "border-2 border-dashed border-white/40 bg-white/5"
                      : "border border-dashed border-[#3a3a3a] bg-[#222] hover:border-white/20",
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white/50 animate-spin" />
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

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-[13px] text-[#8a8a8a]">
              {selectionCount} of {maxSelections} selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#8a8a8a] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white disabled:opacity-50 transition-opacity"
                style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
              >
                Confirm Selection
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={mediaType === "video" ? "video/*" : "image/*"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
              e.target.value = "";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
