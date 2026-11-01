"use client";

import { createElement, FormEvent, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Globe,
  Hash,
  Languages,
  Link2,
  Loader2,
  RectangleVertical,
  Scissors,
  Search,
  SlidersHorizontal,
  Timer,
  Type,
} from "lucide-react";
import { StyleMenuButton } from "@/features/artist/components/StyleMenuButton";
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

const SECTION_LABEL = "text-[11px] font-semibold uppercase tracking-widest text-white/50";
const FIELD_ROW =
  "flex h-11 w-full items-center gap-3 rounded-xl border border-white/10 bg-transparent px-3 transition-colors focus-within:border-blue-300/50";
const FIELD_INPUT =
  "ml-auto h-full min-w-0 flex-1 bg-transparent text-right text-xs text-white outline-none placeholder:text-white/35";

/** Settings rows on the hero: no fill, just the outline. */
const MENU_TRIGGER =
  "bg-transparent hover:bg-transparent hover:border-white/25 data-[state=open]:bg-transparent data-[state=open]:border-blue-300/50";

const LANGUAGE_OPTIONS = LANGUAGES.map((l) => ({ id: l.value, label: l.label }));
const RATIO_OPTIONS = RATIOS.map((r) => ({ id: String(r.value), label: `${r.label} · ${r.hint}` }));
const LENGTH_OPTIONS = PREFER_LENGTHS.map((p) => ({ id: String(p.value), label: p.label }));
const SOURCE_OPTIONS = VIDEO_TYPES.map((t) => ({ id: String(t.value), label: t.label }));

/** Temporarily hidden — kept wired so they can be switched back on. */
const SHOW_PROVIDER_FIELDS = false;

interface CreateClippingFormProps {
  onSubmit: (values: CreateVideoClippingRequest) => void;
  isSubmitting: boolean;
  /** Extra classes for the form card (e.g. a glass look on the studio hero). */
  className?: string;
}

export function CreateClippingForm({
  onSubmit,
  isSubmitting,
  className,
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

  const {
    data: cost,
    isFetching: costLoading,
    isError: costError,
  } = useClippingCostQuery(normalizedUrl);

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

  const canSubmit = !isSubmitting && !!videoUrl.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5",
        className,
      )}
    >
      {/* Link */}
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Video link</span>
        <div
          className={cn(
            "flex h-12 items-center gap-2.5 rounded-xl border bg-transparent pr-2 pl-3 transition-colors focus-within:border-blue-300/50",
            error ? "border-red-500/60" : "border-white/10",
          )}
        >
          <Link2 className="size-4 shrink-0 text-blue-300" />
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
            {createElement(videoTypeIcon(effectiveType), { className: "size-3.5 text-blue-300" })}
            <span className="hidden sm:inline">{videoTypeLabel(effectiveType)}</span>
            {cost?.sourceDurationMinutes ? (
              <span className="text-white/45">· {Math.round(cost.sourceDurationMinutes)} min</span>
            ) : null}
          </span>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Settings, in the same rows as the create sidebar */}
      <div className="flex flex-col gap-2">
        <span className={SECTION_LABEL}>Settings</span>
        <div className="grid gap-2 sm:grid-cols-3">
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
            icon={RectangleVertical}
            label="Ratio"
            options={RATIO_OPTIONS}
            selected={[String(ratioOfClip)]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([value]) => value && setRatioOfClip(Number(value))}
          />
          <StyleMenuButton
            icon={Timer}
            label="Length"
            options={LENGTH_OPTIONS}
            selected={[String(preferLength)]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([value]) => value && setPreferLength(Number(value))}
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
          className={cn(
            "ml-auto size-4 text-white/40 transition-transform",
            showAdvanced && "rotate-180",
          )}
        />
      </button>

      {showAdvanced && (
        <div className="grid gap-3 rounded-xl border border-white/10 bg-transparent p-3 sm:grid-cols-2">
          <StyleMenuButton
            icon={Globe}
            label="Source"
            options={SOURCE_OPTIONS}
            selected={[String(effectiveType)]}
            max={1}
            triggerClassName={MENU_TRIGGER}
            onChange={([value]) => value && setVideoTypeOverride(Number(value))}
          />
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
            <span className="shrink-0 text-sm font-medium text-white">Keyword</span>
            <input
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Optional"
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
                    ? "border-blue-400/60 bg-blue-500/20 text-white"
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

      {/* Same glowing gradient button as the create sidebar */}
      <div className="group/btn relative">
        <div
          className={cn(
            "pointer-events-none absolute -inset-1.5 rounded-xl blur-lg transition-opacity duration-500",
            canSubmit ? "opacity-40 group-hover/btn:opacity-70" : "opacity-[0.05]",
          )}
          style={{ background: "var(--gradient-create)" }}
        />
        <div
          className="relative rounded-xl p-px"
          style={{ background: canSubmit ? "var(--gradient-create)" : "var(--border)" }}
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
            ) : (
              <>
                <Scissors className="size-4" />
                <span>Create clips</span>
                <span className="text-white/40">|</span>
                <span
                  title={costError ? "Couldn't calculate the cost for this link" : undefined}
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
                  ) : cost && normalizedUrl ? (
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
          Couldn&apos;t calculate the cost for this link yet. Check the link, or try again in a moment.
        </p>
      )}
      {!costError && !normalizedUrl && (
        <p className="-mt-2 text-center text-[11px] text-white/40">
          Paste a link to see the credit cost.
        </p>
      )}
    </form>
  );
}
