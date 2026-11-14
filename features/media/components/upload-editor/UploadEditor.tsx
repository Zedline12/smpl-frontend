"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { UploadCrop, UploadEdit, UploadTrim } from "@/features/media/api/upload";
import { ImageReframeEditor } from "./ImageReframeEditor";
import { TRIM_MAX_SECONDS, VideoTrimEditor } from "./VideoTrimEditor";

interface UploadEditorProps {
  file: File;
  mediaType: "image" | "video";
  onBack: () => void;
  /** null = upload the file as it is. */
  onUpload: (edit: UploadEdit | null) => void;
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 * 1024
    ? `${(bytes / 1024 ** 3).toFixed(1)} GB`
    : bytes >= 1024 * 1024
      ? `${(bytes / 1024 ** 2).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * The step between picking a file and uploading it: reframe an image or cut a
 * video (done with ffmpeg on our backend), or upload it as it is.
 */
export function UploadEditor({ file, mediaType, onBack, onUpload }: UploadEditorProps) {
  // Made in the effect (not useMemo): React dev mode runs effects twice, and the
  // cleanup would revoke a memoized URL that's still in use, breaking the preview.
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const next = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  const [crop, setCrop] = useState<UploadCrop | null>(null);
  const [trim, setTrim] = useState<UploadTrim | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const edit: UploadEdit | null =
    previewFailed ? null
    : mediaType === "image" ? (crop ? { type: "image", crop } : null)
    : trim ? { type: "video", trim }
    : null;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-3 px-5 pt-5 pb-4 pr-16 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to uploads"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-white">
            {mediaType === "image" ? "Reframe image" : "Cut video"}
          </p>
          <p className="text-[12px] text-[#8a8a8a] truncate">
            {file.name} · {formatSize(file.size)}
          </p>
        </div>
      </div>
      <div className="h-px w-full bg-white/20 flex-shrink-0" />

      <div className="flex-1 overflow-y-auto px-5 py-5" style={{ minHeight: 0 }}>
        {previewFailed ? (
          <div className="flex flex-col items-center justify-center gap-2 h-48 rounded-xl bg-white/[0.04] text-center px-6">
            <p className="text-[14px] font-medium text-white">
              Your browser can&apos;t preview this {mediaType}
            </p>
            <p className="text-[13px] text-[#8a8a8a]">
              You can still upload it as it is.
            </p>
          </div>
        ) : !url ? null : mediaType === "image" ? (
          <ImageReframeEditor src={url} onChange={setCrop} onError={() => setPreviewFailed(true)} />
        ) : (
          <VideoTrimEditor src={url} onChange={setTrim} onError={() => setPreviewFailed(true)} />
        )}
      </div>

      <div
        className="flex items-center justify-between gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span className="text-[13px] text-[#8a8a8a] hidden sm:block">
          {previewFailed
            ? "Upload as it is"
            : mediaType === "image"
              ? "Choose a ratio and drag to frame it"
              : `Drag the handles to keep up to ${TRIM_MAX_SECONDS / 60} minutes`}
        </span>
        <div className="flex gap-3 ml-auto">
          {edit && (
            <button
              type="button"
              onClick={() => onUpload(null)}
              className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#b5b5b5] hover:text-white transition-colors"
            >
              Upload original
            </button>
          )}
          <button
            type="button"
            onClick={() => onUpload(edit)}
            className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-opacity"
            style={{ background: "linear-gradient(135deg, #6b41ff 0%, #ea4bff 100%)" }}
          >
            {edit ? (mediaType === "image" ? "Crop & upload" : "Cut & upload") : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
