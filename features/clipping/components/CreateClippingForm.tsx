"use client";

import { createElement, FormEvent, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FileVideo,
  Globe,
  Hash,
  Languages,
  Link2,
  Loader2,
  Scissors,
  Search,
  SlidersHorizontal,
  Timer,
  Type,
  UploadCloud,
  X,
} from "lucide-react";
import { StyleMenuButton } from "@/features/artist/components/StyleMenuButton";
import { readVideoDuration } from "@/features/artist/utils/audio-clip";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LANG,
  INITIAL_VIDEO_TYPE,
  LANGUAGES,
  MAX_CLIP_NUMBER,
  MIN_CLIP_NUMBER,
  PREFER_LENGTHS,
  VIDEO_TYPES,
} from "../constants";
import { videoTypeIcon } from "../icons";
import { useClippingCostQuery } from "../hooks/use-clipping";
import { uploadClippingVideo } from "../api";
import { CreateVideoClippingRequest } from "../types";
import { PlatformPicker } from "./PlatformPicker";
import { detectVideoType, normalizeVideoUrl, videoTypeLabel } from "../utils";
import {
  ClippingPlatformId,
  DEFAULT_PLATFORMS,
  SHAPES,
  groupByShape,
  lengthRangeLabel,
} from "../platforms";

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-widest text-white/50";
const FIELD_ROW =
  "flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-transparent px-3 transition-colors focus-within:border-white/50";
const FIELD_INPUT =
  "ml-auto h-full min-w-0 flex-1 bg-transparent text-right text-xs text-white outline-none placeholder:text-white/35";

/** Settings rows on the hero: no fill, just the outline. */
const MENU_TRIGGER =
  "bg-transparent hover:bg-transparent hover:border-white/25 data-[state=open]:bg-transparent data-[state=open]:border-white/50";

const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({ id: l.value, label: l.label }));
const LENGTH_OPTIONS = [
  { id: "platform", label: "Best for my platforms" },
  ...PREFER_LENGTHS.map((p) => ({ id: String(p.value), label: p.label })),
];
const SOURCE_OPTIONS = VIDEO_TYPES.map((t) => ({ id: String(t.value), label: t.label }));

const UPLOAD_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v", "video/x-matroska"];
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 * 1024;
const MAX_UPLOAD_SECONDS = 2 * 60 * 60;
const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-m4v": "m4v",
  "video/x-matroska": "mkv",
};

/** Temporarily hidden — kept wired so they can be switched back on. */
const SHOW_PROVIDER_FIELDS = false;

interface CreateClippingFormProps {
  onSubmit: (values: CreateVideoClippingRequest) => void;
  isSubmitting: boolean;
  /** Extra classes for the form card (e.g. a glass look on the studio hero). */
  className?: string;
}

interface Upload {
  name: string;
  size: number;
  ext: string;
  seconds: number | null;
  progress: number;
  url: string | null;
  error: string | null;
}

export function CreateClippingForm({
  onSubmit,
  isSubmitting,
  className,
}: CreateClippingFormProps) {
  const [sourceKind, setSourceKind] = useState<"link" | "upload">("link");
  const [videoUrl, setVideoUrl] = useState("");
  const [upload, setUpload] = useState<Upload | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [platforms, setPlatforms] = useState<ClippingPlatformId[]>(DEFAULT_PLATFORMS);
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [length, setLength] = useState<string>("platform");
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced
  const [videoTypeOverride, setVideoTypeOverride] = useState<number | null>(null);
  const [projectName, setProjectName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [maxClipNumber, setMaxClipNumber] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [clipModel, setClipModel] = useState("");
  const [removeSilence, setRemoveSilence] = useState(false);
  const [subtitles, setSubtitles] = useState(true);
  const [headline, setHeadline] = useState(true);

  const normalizedUrl = useMemo(() => normalizeVideoUrl(videoUrl), [videoUrl]);
  const detectedType = useMemo(
    () => (normalizedUrl ? detectVideoType(normalizedUrl) : null),
    [normalizedUrl],
  );
  // Before anything is typed the form assumes YouTube.
  const effectiveType = videoTypeOverride ?? detectedType ?? INITIAL_VIDEO_TYPE;

  const sourceUrl = sourceKind === "upload" ? (upload?.url ?? null) : normalizedUrl;
  const groups = useMemo(() => groupByShape(platforms), [platforms]);

  const {
    data: cost,
    isFetching: costLoading,
    isError: costError,
  } = useClippingCostQuery(sourceUrl, platforms, sourceKind);

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!UPLOAD_TYPES.includes(file.type)) {
      setError("Upload an MP4, MOV, WebM, M4V or MKV video.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Videos can be up to 4 GB.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const seconds = await readVideoDuration(objectUrl).finally(() => URL.revokeObjectURL(objectUrl));
    if (seconds !== null && seconds > MAX_UPLOAD_SECONDS) {
      setError("Videos can be up to 2 hours long.");
      return;
    }
    const base: Upload = {
      name: file.name,
      size: file.size,
      ext: EXT_BY_TYPE[file.type] ?? "mp4",
      seconds,
      progress: 0,
      url: null,
      error: null,
    };
    setUpload(base);
    try {
      const url = await uploadClippingVideo(file, (progress) =>
        setUpload((u) => (u && u.name === file.name ? { ...u, progress } : u)),
      );
      setUpload((u) => (u && u.name === file.name ? { ...u, progress: 1, url } : u));
    } catch (err) {
      setUpload((u) =>
        u && u.name === file.name
          ? { ...u, error: err instanceof Error ? err.message : "Upload failed" }
          : u,
      );
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!platforms.length) {
      setError("Pick at least one platform.");
      return;
    }
    if (sourceKind === "link" && !normalizedUrl) {
      setError("Enter a valid video link, for example youtube.com/watch?v=…");
      return;
    }
    if (sourceKind === "upload" && !upload?.url) {
      setError(upload?.error ?? "Upload a video first.");
      return;
    }
    const clipCount = maxClipNumber.trim() ? Number.parseInt(maxClipNumber, 10) : undefined;
    if (
      clipCount !== undefined &&
      (!Number.isFinite(clipCount) || clipCount < MIN_CLIP_NUMBER || clipCount > MAX_CLIP_NUMBER)
    ) {
      setError(`Max clips must be between ${MIN_CLIP_NUMBER} and ${MAX_CLIP_NUMBER}.`);
      return;
    }
    const parsedTemplateId = templateId.trim() ? Number.parseInt(templateId, 10) : undefined;

    setError(null);
    onSubmit({
      videoUrl: sourceKind === "upload" ? upload!.url! : normalizedUrl!,
      sourceKind,
      ...(sourceKind === "upload" ? { ext: upload!.ext, videoType: 1 } : { videoType: effectiveType }),
      lang,
      platforms,
      // Without a choice, each platform's best lengths are used.
      ...(length !== "platform" ? { preferLength: [Number(length)] } : {}),
      ...(clipCount !== undefined ? { maxClipNumber: clipCount } : {}),
      ...(parsedTemplateId !== undefined && Number.isFinite(parsedTemplateId)
        ? { templateId: parsedTemplateId }
        : {}),
      ...(keyword.trim() ? { keyword: keyword.trim() } : {}),
      ...(projectName.trim() ? { projectName: projectName.trim() } : {}),
      ...(clipModel.trim() ? { clipModel: clipModel.trim() } : {}),
      removeSilence,
      subtitles,
      headline,
    });

    setVideoUrl("");
    setUpload(null);
    setProjectName("");
    setKeyword("");
  };

  const uploading = sourceKind === "upload" && !!upload && !upload.url && !upload.error;
  const hasSource = sourceKind === "upload" ? !!upload?.url : !!videoUrl.trim();
  const canSubmit = !isSubmitting && hasSource && platforms.length > 0 && !uploading;
  const minutes =
    cost?.sourceDurationMinutes ??
    (sourceKind === "upload" && upload?.seconds ? Math.max(1, Math.ceil(upload.seconds / 60)) : null);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5", className)}
    >
      {/* Source */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className={SECTION_LABEL}>Your video</span>
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {(["link", "upload"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setSourceKind(kind);
                  setError(null);
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  sourceKind === kind ? "bg-white text-black" : "text-white/60 hover:text-white",
                )}
              >
                {kind === "link" ? <Link2 className="size-3" /> : <UploadCloud className="size-3" />}
                {kind === "link" ? "Paste link" : "Upload file"}
              </button>
            ))}
          </div>
        </div>

        {sourceKind === "link" ? (
          <div
            className={cn(
              "flex h-12 items-center gap-2.5 rounded-xl border bg-transparent pr-2 pl-3 transition-colors focus-within:border-white/50",
              error ? "border-red-500/60" : "border-white/10",
            )}
          >
            <Link2 className="size-4 shrink-0 text-white/80" />
            <input
              type="text"
              inputMode="url"
              value={videoUrl}
              onChange={(event) => {
                setVideoUrl(event.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste a YouTube, TikTok, Twitch… link"
              aria-label="Video URL"
              aria-invalid={!!error}
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <span
              title={videoTypeLabel(effectiveType)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-transparent px-2 py-1 text-[11px] font-medium text-white/70"
            >
              {createElement(videoTypeIcon(effectiveType), { className: "size-3.5 text-white" })}
              <span className="hidden sm:inline">{videoTypeLabel(effectiveType)}</span>
              {minutes ? <span className="text-white/45">· {minutes} min</span> : null}
            </span>
          </div>
        ) : upload ? (
          <div className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
            <FileVideo className="size-5 shrink-0 text-white/70" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{upload.name}</p>
              {upload.error ? (
                <p className="text-[11px] text-red-400">{upload.error}</p>
              ) : upload.url ? (
                <p className="text-[11px] text-white/45">
                  Uploaded{minutes ? ` · ${minutes} min` : ""}
                </p>
              ) : (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-white transition-[width]"
                    style={{ width: `${Math.round(upload.progress * 100)}%` }}
                  />
                </div>
              )}
            </div>
            {uploading ? (
              <span className="text-[11px] text-white/50">{Math.round(upload.progress * 100)}%</span>
            ) : (
              <button
                type="button"
                onClick={() => setUpload(null)}
                aria-label="Remove video"
                className="flex size-7 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void pickFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
              dragging ? "border-white/60 bg-white/[0.06]" : "border-white/15 hover:border-white/30",
            )}
          >
            <UploadCloud className="size-6 text-white/70" />
            <span className="text-sm font-medium text-white">Drop a video or click to upload</span>
            <span className="text-[11px] text-white/45">MP4, MOV, WebM · up to 2 hours</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept={UPLOAD_TYPES.join(",")}
          hidden
          onChange={(e) => {
            void pickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Platforms */}
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Where will you post?</span>
        <PlatformPicker value={platforms} onChange={setPlatforms} />
        {groups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <span
                key={g.ratio}
                className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[11px] text-white/70"
              >
                <ShapeGlyph ratio={g.ratio} />
                <span className="font-semibold text-white">
                  {SHAPES[g.ratio].name} {SHAPES[g.ratio].label}
                </span>
                <span className="text-white/45">
                  {g.platforms.map((p) => p.short).join(", ")} ·{" "}
                  {length === "platform"
                    ? lengthRangeLabel(g.preferLength)
                    : LENGTH_OPTIONS.find((o) => o.id === length)?.label}
                </span>
              </span>
            ))}
            {groups.length > 1 && (
              <span className="self-center text-[11px] text-white/40">
                {groups.length} clip sets, charged per set
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-amber-300/80">Pick at least one platform.</p>
        )}
      </div>

      {/* Settings */}
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Settings</span>
        <div className="grid gap-2 sm:grid-cols-2">
          <StyleMenuButton
            icon={Languages}
            label="Language"
            options={LANGUAGE_OPTIONS}
            selected={[lang]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([value]) => value && setLang(value)}
          />
          <StyleMenuButton
            icon={Timer}
            label="Clip length"
            options={LENGTH_OPTIONS}
            selected={[length]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([value]) => value && setLength(value)}
          />
        </div>
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={() => setShowAdvanced((previous) => !previous)}
        className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-transparent px-3 text-left transition-colors hover:border-white/25"
      >
        <SlidersHorizontal className="size-4 shrink-0 text-white/50" />
        <span className="text-sm font-medium text-white">Advanced options</span>
        <ChevronDown
          className={cn("ml-auto size-4 text-white/40 transition-transform", showAdvanced && "rotate-180")}
        />
      </button>

      {showAdvanced && (
        <div className="grid gap-3 rounded-xl border border-white/10 bg-transparent p-3 sm:grid-cols-2">
          {sourceKind === "link" && (
            <StyleMenuButton
              icon={Globe}
              label="Source"
              options={SOURCE_OPTIONS}
              selected={[String(effectiveType)]}
              max={1}
              triggerClassName={MENU_TRIGGER}
              onChange={([value]) => value && setVideoTypeOverride(Number(value))}
            />
          )}
          <label className={FIELD_ROW}>
            <Hash className="size-4 shrink-0 text-white/50" />
            <span className="shrink-0 text-sm font-medium text-white">Max clips</span>
            <input
              type="number"
              min={MIN_CLIP_NUMBER}
              max={MAX_CLIP_NUMBER}
              value={maxClipNumber}
              onChange={(event) => setMaxClipNumber(event.target.value)}
              placeholder="Auto"
              className={FIELD_INPUT}
            />
          </label>
          <label className={FIELD_ROW}>
            <Type className="size-4 shrink-0 text-white/50" />
            <span className="shrink-0 text-sm font-medium text-white">Name</span>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Optional"
              className={FIELD_INPUT}
            />
          </label>
          <label className={FIELD_ROW}>
            <Search className="size-4 shrink-0 text-white/50" />
            <span className="shrink-0 text-sm font-medium text-white">Focus on</span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="e.g. pricing, funny moments"
              className={FIELD_INPUT}
            />
          </label>

          {SHOW_PROVIDER_FIELDS && (
            <>
              <label className={FIELD_ROW}>
                <span className="shrink-0 text-sm font-medium text-white">Template ID</span>
                <input
                  type="number"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  placeholder="Optional"
                  className={FIELD_INPUT}
                />
              </label>
              <label className={FIELD_ROW}>
                <span className="shrink-0 text-sm font-medium text-white">Clip model</span>
                <input
                  type="text"
                  value={clipModel}
                  onChange={(event) => setClipModel(event.target.value)}
                  placeholder="Optional"
                  className={FIELD_INPUT}
                />
              </label>
            </>
          )}

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            {[
              { label: "Remove silence", value: removeSilence, set: setRemoveSilence },
              { label: "Subtitles", value: subtitles, set: setSubtitles },
              { label: "Headline", value: headline, set: setHeadline },
            ].map((toggle) => (
              <button
                key={toggle.label}
                type="button"
                aria-pressed={toggle.value}
                onClick={() => toggle.set(!toggle.value)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  toggle.value
                    ? "border-white/60 bg-white/20 text-white"
                    : "border-white/10 text-white/60 hover:text-white",
                )}
              >
                {toggle.value && <Check className="size-3" />}
                {toggle.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Glowing white button as the create sidebar */}
      <div className="group/btn relative">
        <div
          className={cn(
            "pointer-events-none absolute -inset-1.5 rounded-xl blur-lg transition-opacity duration-500",
            canSubmit ? "opacity-40 group-hover/btn:opacity-70" : "opacity-[0.05]",
          )}
          style={{ background: "rgba(255,255,255,0.85)" }}
        />
        <div
          className="relative rounded-xl p-px"
          style={{ background: canSubmit ? "rgba(255,255,255,0.85)" : "var(--border)" }}
        >
          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold backdrop-blur-md transition-colors disabled:cursor-not-allowed",
              canSubmit ? "bg-black/50 text-white hover:bg-black/30" : "bg-black/60 text-white/40",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Starting…
              </>
            ) : uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Scissors className="size-4" />
                <span>Create clips</span>
                <span className="text-white/40">|</span>
                <span
                  title={costError ? "Couldn't calculate the cost for this video" : undefined}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3.5">
                    <path
                      fillRule="evenodd"
                      d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {costLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : cost && sourceUrl ? (
                    cost.creditsCost
                  ) : costError ? (
                    "?"
                  ) : (
                    "—"
                  )}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
      {costError && (
        <p className="-mt-2 text-center text-[11px] text-amber-300/80">
          Couldn&apos;t calculate the cost for this video yet. Check it, or try again in a moment.
        </p>
      )}
      {!costError && !sourceUrl && (
        <p className="-mt-2 text-center text-[11px] text-white/40">
          {sourceKind === "upload" ? "Upload a video" : "Paste a link"} to see the credit cost.
        </p>
      )}
    </form>
  );
}

/** Tiny outline in the shape's proportions. */
export function ShapeGlyph({ ratio }: { ratio: number }) {
  const size = { 1: [8, 14], 2: [12, 12], 3: [10, 12.5], 4: [16, 9] }[ratio] ?? [8, 14];
  return (
    <span
      className="inline-block shrink-0 rounded-[2px] border-[1.5px] border-current"
      style={{ width: size[0], height: size[1] }}
    />
  );
}
