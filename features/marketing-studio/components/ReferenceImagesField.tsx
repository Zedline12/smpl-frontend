"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { MAX_REFERENCE_IMAGES } from "../types";

interface ReferenceImagesFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

/** Same thumbnail grid + dashed add tile the prompt composers use. */
export function ReferenceImagesField({
  images,
  onChange,
}: ReferenceImagesFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const removeImage = (url: string) => {
    onChange(images.filter((image) => image !== url));
  };

  return (
    <>
      <div className="flex max-w-[400px] flex-row flex-wrap gap-2">
        {images.map((url, index) => (
          <div
            key={url + index}
            className="group relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5"
          >
            <img src={url} alt="Ref" className="h-full w-full object-cover" />
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
            className="group flex h-20 w-20 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-primary/50 hover:bg-white/5"
          >
            <Plus className="text-muted group-hover:text-primary size-6 transition-colors" />
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
    </>
  );
}
