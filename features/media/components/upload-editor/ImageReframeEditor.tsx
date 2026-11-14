"use client";

import { useState } from "react";
import Cropper, { type Area, type MediaSize } from "react-easy-crop";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { UploadCrop } from "@/features/media/api/upload";

const RATIOS: { label: string; value: number | null }[] = [
  { label: "Original", value: null },
  { label: "1:1", value: 1 },
  { label: "9:16", value: 9 / 16 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:2", value: 3 / 2 },
];

interface ImageReframeEditorProps {
  src: string;
  /** The crop to apply, or null when the whole image is kept. */
  onChange: (crop: UploadCrop | null) => void;
  onError: () => void;
}

/** Drag and zoom to choose the part of the image to keep, at a chosen aspect ratio. */
export function ImageReframeEditor({ src, onChange, onError }: ImageReframeEditorProps) {
  const [media, setMedia] = useState<MediaSize | null>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const aspect = ratio ?? (media ? media.naturalWidth / media.naturalHeight : 1);

  const handleComplete = (_: Area, px: Area) => {
    setArea(px);
    if (!media) return;
    const whole =
      px.x <= 1 &&
      px.y <= 1 &&
      px.width >= media.naturalWidth - 2 &&
      px.height >= media.naturalHeight - 2;
    onChange(
      whole
        ? null
        : {
            x: Math.max(0, Math.round(px.x)),
            y: Math.max(0, Math.round(px.y)),
            width: Math.round(px.width),
            height: Math.round(px.height),
            displayWidth: media.naturalWidth,
            displayHeight: media.naturalHeight,
          },
    );
  };

  const chooseRatio = (value: number | null) => {
    setRatio(value);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[min(52vh,440px)] rounded-xl overflow-hidden bg-black">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          minZoom={1}
          maxZoom={5}
          showGrid
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleComplete}
          onMediaLoaded={setMedia}
          mediaProps={{ onError }}
        />
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Aspect ratio">
        {RATIOS.map((r) => {
          const active = ratio === r.value;
          return (
            <button
              key={r.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => chooseRatio(r.value)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                active
                  ? "bg-white text-black"
                  : "bg-white/[0.06] text-[#b5b5b5] hover:text-white hover:bg-white/10",
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <ZoomOut className="w-4 h-4 text-[#8a8a8a] shrink-0" aria-hidden />
        <Slider
          value={[zoom]}
          min={1}
          max={5}
          step={0.01}
          onValueChange={(v) => setZoom(v[0] ?? 1)}
          aria-label="Zoom"
        />
        <ZoomIn className="w-4 h-4 text-[#8a8a8a] shrink-0" aria-hidden />
        <span className="text-[12px] text-[#8a8a8a] tabular-nums whitespace-nowrap min-w-[92px] text-right">
          {area ? `${Math.round(area.width)} × ${Math.round(area.height)}` : "—"}
        </span>
      </div>
    </div>
  );
}
