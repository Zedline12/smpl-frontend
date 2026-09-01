"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, Loader2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_LANG,
  DEFAULT_PREFER_LENGTH,
  DEFAULT_RATIO,
  INITIAL_VIDEO_TYPE,
  LANGUAGES,
  MAX_CLIP_NUMBER,
  MIN_CLIP_NUMBER,
  PREFER_LENGTHS,
  RATIOS,
  VIDEO_TYPES,
} from "../constants";
import { videoTypeIcon } from "../icons";
import { useClippingCostQuery } from "../hooks/use-clipping";
import { CreateVideoClippingRequest } from "../types";
import { detectVideoType, normalizeVideoUrl, videoTypeLabel } from "../utils";

const FIELD_CLASS =
  "border-border bg-background-light text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 w-full rounded-xl! border! px-3! text-sm! outline-none!";

/** Temporarily hidden — kept wired so they can be switched back on. */
const SHOW_PROVIDER_FIELDS = false;

interface CreateClippingFormProps {
  onSubmit: (values: CreateVideoClippingRequest) => void;
  isSubmitting: boolean;
}

export function CreateClippingForm({
  onSubmit,
  isSubmitting,
}: CreateClippingFormProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [preferLength, setPreferLength] = useState<number>(
    DEFAULT_PREFER_LENGTH,
  );
  const [ratioOfClip, setRatioOfClip] = useState(DEFAULT_RATIO);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced
  const [videoTypeOverride, setVideoTypeOverride] = useState<number | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [maxClipNumber, setMaxClipNumber] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [clipModel, setClipModel] = useState("");
  const [removeSilence, setRemoveSilence] = useState(false);
  const [subtitles, setSubtitles] = useState(false);
  const [headline, setHeadline] = useState(false);

  const normalizedUrl = useMemo(
    () => normalizeVideoUrl(videoUrl),
    [videoUrl],
  );
  const detectedType = useMemo(
    () => (normalizedUrl ? detectVideoType(normalizedUrl) : null),
    [normalizedUrl],
  );
  // Before anything is typed the form assumes YouTube.
  const effectiveType = videoTypeOverride ?? detectedType ?? INITIAL_VIDEO_TYPE;
  const SourceIcon = videoTypeIcon(effectiveType);

  const { data: cost } = useClippingCostQuery(normalizedUrl);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!normalizedUrl) {
      setError("Enter a valid video link, for example youtube.com/watch?v=…");
      return;
    }
    const clipCount = maxClipNumber.trim()
      ? Number.parseInt(maxClipNumber, 10)
      : undefined;
    if (
      clipCount !== undefined &&
      (!Number.isFinite(clipCount) ||
        clipCount < MIN_CLIP_NUMBER ||
        clipCount > MAX_CLIP_NUMBER)
    ) {
      setError(`Max clips must be between ${MIN_CLIP_NUMBER} and ${MAX_CLIP_NUMBER}.`);
      return;
    }

    const parsedTemplateId = templateId.trim()
      ? Number.parseInt(templateId, 10)
      : undefined;

    setError(null);
    onSubmit({
      videoUrl: normalizedUrl,
      lang,
      // Single choice in the UI, array on the wire.
      preferLength: [preferLength],
      videoType: effectiveType,
      ratioOfClip,
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
    setProjectName("");
    setKeyword("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-card rounded-2xl border p-4 sm:p-5"
    >
      <h2 className="text-foreground text-sm font-semibold">
        Clip a video
      </h2>
      <p className="text-muted-foreground mt-1 text-xs">
        Paste a link and we&apos;ll cut it into short, shareable clips.
      </p>

      {/* URL */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SourceIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            inputMode="url"
            value={videoUrl}
            onChange={(event) => {
              setVideoUrl(event.target.value);
              if (error) setError(null);
            }}
            placeholder="youtube.com/watch?v=…"
            aria-label="Video URL"
            aria-invalid={!!error}
            className={cn(FIELD_CLASS, "pl-9!", error && "border-red-500/60!")}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !videoUrl.trim()}
          className="bg-gradient-primary flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Scissors className="size-4" />
              Create clips
              {/* Same `label | ⚡ N` shape as the generate button. */}
              <span className="mx-0.5 text-white/40">|</span>
              <span className="flex flex-row items-center gap-0.5 opacity-60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                {cost?.creditsCost ?? 0}
              </span>
            </>
          )}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

      <p className="text-muted-foreground mt-2 text-xs">
        Source:{" "}
        <span className="text-foreground font-medium">
          {videoTypeLabel(effectiveType)}
        </span>
        {videoTypeOverride !== null && " (manual)"}
        {cost?.sourceDurationMinutes ? (
          <>
            {" · "}
            <span className="text-foreground font-medium">
              {Math.round(cost.sourceDurationMinutes)} min
            </span>{" "}
            video
          </>
        ) : null}
      </p>

      {/* Language + length + ratio */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Spoken language
          </span>
          <select
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            className={FIELD_CLASS}
          >
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            Clip aspect ratio
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setRatioOfClip(ratio.value)}
                title={ratio.hint}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  ratioOfClip === ratio.value
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Preferred clip length
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PREFER_LENGTHS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreferLength(option.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                preferLength === option.value
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced */}
      <button
        type="button"
        onClick={() => setShowAdvanced((previous) => !previous)}
        className="text-muted-foreground hover:text-foreground mt-4 flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors"
      >
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform",
            showAdvanced && "rotate-180",
          )}
        />
        Advanced options
      </button>

      {showAdvanced && (
        <div className="border-border mt-3 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Source type
            </span>
            <select
              value={effectiveType}
              onChange={(event) =>
                setVideoTypeOverride(Number(event.target.value))
              }
              className={FIELD_CLASS}
            >
              {VIDEO_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Project name
            </span>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Optional"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Keyword focus
            </span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Optional"
              className={FIELD_CLASS}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-muted-foreground text-xs font-medium">
              Max clips ({MIN_CLIP_NUMBER}–{MAX_CLIP_NUMBER})
            </span>
            <input
              type="number"
              min={MIN_CLIP_NUMBER}
              max={MAX_CLIP_NUMBER}
              value={maxClipNumber}
              onChange={(event) => setMaxClipNumber(event.target.value)}
              placeholder="Auto"
              className={FIELD_CLASS}
            />
          </label>

          {SHOW_PROVIDER_FIELDS && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">
                  Template ID
                </span>
                <input
                  type="number"
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  placeholder="Optional"
                  className={FIELD_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-muted-foreground text-xs font-medium">
                  Clip model
                </span>
                <input
                  type="text"
                  value={clipModel}
                  onChange={(event) => setClipModel(event.target.value)}
                  placeholder="Optional"
                  className={FIELD_CLASS}
                />
              </label>
            </>
          )}

          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {[
              {
                label: "Remove silence",
                value: removeSilence,
                set: setRemoveSilence,
              },
              { label: "Subtitles", value: subtitles, set: setSubtitles },
              { label: "Headline", value: headline, set: setHeadline },
            ].map((toggle) => (
              <label
                key={toggle.label}
                className="text-foreground flex cursor-pointer items-center gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={toggle.value}
                  onChange={(event) => toggle.set(event.target.checked)}
                  className="accent-primary size-4 cursor-pointer"
                />
                {toggle.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
