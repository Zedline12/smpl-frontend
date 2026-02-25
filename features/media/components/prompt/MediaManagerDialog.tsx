"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaItem {
  url: string;
  type: "image" | "video";
  publicId: string;
}

interface MediaManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImages: string[];
  onSelect: (urls: string[]) => void;
}

export function MediaManagerDialog({
  open,
  onOpenChange,
  selectedImages,
  onSelect,
}: MediaManagerDialogProps) {
  const [activeTab, setActiveTab] = useState("library");
  const [libraryImages, setLibraryImages] = useState<MediaItem[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempSelection, setTempSelection] = useState<string[]>([]);

  // Initialize temp selection when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelection(selectedImages);
      fetchLibrary();
    }
  }, [open, selectedImages]);

  const fetchLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const res = await fetch("/api/media/reference-images");
        const json = await res.json();
        setLibraryImages(json.data || []);
    } catch (error) {
      toast.error("Failed to load image library");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // 1. get signature
        const sigRes = await fetch("/api/media/upload-signature");
        const json=await sigRes.json();
        const { timestamp, signature, apiKey, cloudName, folder } = json.data;

      // 2. upload to cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder || "your-app");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const uploadedUrl = data.secure_url;

      toast.success("Image uploaded successfully");

      // Auto-select the uploaded image
      if (tempSelection.length < 5) {
        setTempSelection((prev) => [...prev, uploadedUrl]);
      } else {
        toast.info(
          "Maximum of 5 images already selected. Uploaded image added to library.",
        );
      }

      // Refresh library to show the new image
      fetchLibrary();
      setActiveTab("library");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      uploadImage(file);
    }
  };

  const toggleSelection = (url: string) => {
    setTempSelection((prev) => {
      if (prev.includes(url)) {
        return prev.filter((item) => item !== url);
      }
      if (prev.length >= 5) {
        toast.warning("You can only select up to 5 reference images");
        return prev;
      }
      return [...prev, url];
    });
  };

  const handleConfirm = () => {
    onSelect(tempSelection);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-background-light border-white/10 text-white">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">Manage Media</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <div className="px-6 border-b border-white/5">
            <TabsList className="bg-transparent h-12 gap-6 p-0">
              <TabsTrigger
                value="library"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0"
              >
                Library
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary border-b-2 border-transparent data-[state=active]:border-primary rounded-none h-full px-0"
              >
                Upload
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="library"
            className="flex-1 overflow-y-auto p-6 m-0"
          >
            {isLoadingLibrary ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : libraryImages.length == 0 || libraryImages == undefined ? (
              <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-4">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p>No images found in your library</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {libraryImages.length > 0 && libraryImages.map((item) => (
                  <div
                    key={item.publicId}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all group",
                      tempSelection.includes(item.url)
                        ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                        : "border-transparent hover:border-white/20",
                    )}
                    onClick={() => toggleSelection(item.url)}
                  >
                    <img
                      src={item.url}
                      alt="Ref"
                      className="w-full h-full object-cover"
                    />
                    {tempSelection.includes(item.url) && (
                      <div className="absolute top-2 right-2 bg-primary rounded-full p-1 h-5 w-5 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-[10px] font-medium uppercase tracking-wider">
                        {tempSelection.includes(item.url)
                          ? "Deselect"
                          : "Select"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 p-6 m-0">
            <div
              className={cn(
                "h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all",
                isUploading
                  ? "border-primary/50 bg-primary/5"
                  : "border-white/10 hover:border-primary/40 hover:bg-white/5",
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-medium">Uploading image...</p>
                    <p className="text-sm text-muted-foreground">
                      Please wait a moment
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <UploadCloud className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">Drop an image here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click the button below to browse files
                    </p>
                    <Button
                      variant="outline"
                      className="relative border-white/20 border-white/20"
                      onClick={() =>
                        document.getElementById("file-upload")?.click()
                      }
                    >
                      Browse Files
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file);
                        }}
                      />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-6 border-t border-white/5 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-1 items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {tempSelection.length} of 5 selected
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-primary"
                onClick={handleConfirm}
                disabled={isUploading}
              >
                Save Selection
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
