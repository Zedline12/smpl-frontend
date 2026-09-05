"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadBrandThemeLogo } from "../api";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB — no size convention exists elsewhere in the repo.

interface LogoUploadFieldProps {
  value: string | null;
  onChange: (logoUrl: string | null) => void;
}

export function LogoUploadField({ value, onChange }: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Unlike ImageSlot's inline URL.createObjectURL(), this revokes the previous
  // object URL so selecting a new file doesn't leak the old one.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (selected.size > MAX_LOGO_BYTES) {
      toast.error("Logo must be under 2MB");
      return;
    }

    setFile(selected);
    setIsUploading(true);
    try {
      const logoUrl = await uploadBrandThemeLogo(selected);
      onChange(logoUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload the logo",
      );
      setFile(null);
      onChange(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clear = () => {
    setFile(null);
    onChange(null);
  };

  const displayUrl = previewUrl ?? value;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="border-border bg-background-light hover:border-primary/50 relative flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border transition-colors"
      >
        {displayUrl ? (
          <img src={displayUrl} alt="" className="size-full object-contain p-1.5" />
        ) : (
          <Upload className="text-muted-foreground size-5" />
        )}

        {isUploading && (
          <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-foreground size-4 animate-spin" />
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground text-xs">
          {value ? "Logo uploaded" : "PNG or JPG, up to 2MB"}
        </span>
        {value && !isUploading && (
          <button
            type="button"
            onClick={clear}
            className="text-muted-foreground hover:text-foreground flex w-fit cursor-pointer items-center gap-1 text-xs transition-colors"
          >
            <X className="size-3" />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
