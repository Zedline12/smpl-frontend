"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { MAX_REFERENCE_IMAGES } from "../types";

interface ReferenceImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ReferenceImagesField({
  images,
  onChange,
}: ReferenceImagesFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const removeImage = (url: string) => {
    onChange(images.filter((image) => image !== url));
  };

  return (
    <div>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
        Reference images (optional)
      </label>

      <div className="flex flex-row flex-wrap gap-2">
        {images.map((url, index) => (
          <div
            key={url + index}
            className="group border-border bg-background-light relative h-20 w-20 overflow-hidden rounded-xl border"
          >
            <img src={url} alt="Reference" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
            >
              <X className="size-3 text-white" />
            </button>
          </div>
        ))}

        {images.length < MAX_REFERENCE_IMAGES && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="border-border hover:border-primary/50 hover:bg-background-light flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all"
          >
            <Plus className="text-muted-foreground size-6" />
          </button>
        )}
      </div>

      <MediaManagerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        selectedImages={images}
        onSelect={onChange}
        maxSelections={MAX_REFERENCE_IMAGES}
      />
    </div>
  );
}
