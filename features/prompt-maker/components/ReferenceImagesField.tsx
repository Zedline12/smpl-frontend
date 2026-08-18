"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { MAX_REFERENCE_IMAGES } from "../types/prompt-maker";

interface ReferenceImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ReferenceImagesField({
  images,
  onChange,
}: ReferenceImagesFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-row flex-wrap gap-2">
        {images.map((url, index) => (
          <div
            key={url + index}
            className="group border-border bg-background-light relative h-20 w-20 overflow-hidden rounded-xl border"
          >
            <img src={url} alt="Reference" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((img) => img !== url))}
              className="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}

        {images.length < MAX_REFERENCE_IMAGES && (
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="group border-border hover:border-primary/50 hover:bg-background-light flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all"
          >
            <Plus className="text-muted-foreground group-hover:text-primary h-6 w-6 transition-colors" />
          </button>
        )}
      </div>

      <MediaManagerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedImages={images}
        onSelect={onChange}
        maxSelections={MAX_REFERENCE_IMAGES}
      />
    </>
  );
}
