"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Menu, MenuItem } from "@/components/menu";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import {
  VEO3_ASPECT_RATIOS,
  VEO3_DURATION_SECONDS,
  Veo3AspectRatio,
  Veo3Duration,
} from "@/features/generation/types/models/veo-3.type";
import {
  GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
  GeminiFlashImageAspectRatio,
} from "@/features/generation/types/models/gemini-flash-image.type";
// Both aspect-ratio types are still needed below, to narrow the shared
// AllModelsAspectRatio state back down at submit time for each request shape.
import { AllModelsAspectRatio } from "@/features/generation/types/generation";
import { useBrandThemesQuery } from "@/features/brand-themes/hooks/use-brand-themes";
import { BrandTheme } from "@/features/brand-themes/types";
import { BrandThemeSelector } from "./BrandThemeSelector";
import { ProjectPickerMenu } from "./ProjectPickerMenu";
import { MediaTypeToggle } from "./MediaTypeToggle";
import { IncludeAssetsToggles } from "./IncludeAssetsToggles";
import { CreationResult } from "./CreationResult";
import { ReferenceImagesField } from "./ReferenceImagesField";
import {
  useCreateMarketingAdMutation,
  useCreateMarketingPhotoMutation,
  useMarketingCostQuery,
  useMarketingJobStatus,
} from "../hooks/use-marketing-studio";
import { MarketingStudioMediaType, MAX_DESCRIPTION_LENGTH } from "../types";

const TRIGGER_CLASS =
  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-background-lightest transition-colors bg-background-light border border-border w-full text-center";

export function MarketingCreateWorkspace() {
  const { data: themes } = useBrandThemesQuery();

  const [mediaType, setMediaType] = useState<MarketingStudioMediaType>("photo");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [brandThemeId, setBrandThemeId] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  // AllModelsAspectRatio: the selector's onChange always returns this broader
  // union regardless of which options array it was given.
  const [aspectRatio, setAspectRatio] = useState<AllModelsAspectRatio>("1:1");
  const [durationSeconds, setDurationSeconds] = useState<Veo3Duration>(4);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [includeLogo, setIncludeLogo] = useState(false);
  const [includePrimaryColor, setIncludePrimaryColor] = useState(false);
  const [includeFonts, setIncludeFonts] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [resultMediaType, setResultMediaType] =
    useState<MarketingStudioMediaType>("photo");

  const createAd = useCreateMarketingAdMutation();
  const createPhoto = useCreateMarketingPhotoMutation();
  const { job } = useMarketingJobStatus(activeJobId);

  const selectedTheme = themes?.find((theme) => theme.id === brandThemeId);
  const isSubmitting = createAd.isPending || createPhoto.isPending;

  // Same {model, input} -> {creditsCost} endpoint the prompt composer already
  // uses. Resolution isn't a control here, so it borrows each model's default.
  const { data: cost } = useMarketingCostQuery(
    mediaType === "video"
      ? {
          mediaType: "video",
          input: {
            prompt: description,
            aspectRatio: aspectRatio as Veo3AspectRatio,
            resolution: "720p",
            durationSeconds,
            images: referenceImages,
            generateAudio,
          },
        }
      : {
          mediaType: "photo",
          input: {
            prompt: description,
            aspectRatio: aspectRatio as GeminiFlashImageAspectRatio,
            resolution: "1K",
            images: referenceImages,
          },
        },
  );

  const handleThemeChange = (theme: BrandTheme) => {
    setBrandThemeId(theme.id);
    // Force off rather than merely disable — a disabled-but-on toggle would
    // otherwise submit includeLogo: true for a theme that has no logo.
    if (!theme.logoUrl) setIncludeLogo(false);
    if (!theme.primaryColor) setIncludePrimaryColor(false);
    if (!theme.fonts?.length) setIncludeFonts(false);
  };

  const handleMediaTypeChange = (next: MarketingStudioMediaType) => {
    setMediaType(next);
    // The two models don't share an aspect-ratio set (Veo 3 is 16:9/9:16 only).
    setAspectRatio(next === "video" ? "16:9" : "1:1");
  };

  const buildIncludeFlags = () => ({
    includeLogo: !!selectedTheme?.logoUrl && includeLogo,
    includePrimaryColor: !!selectedTheme?.primaryColor && includePrimaryColor,
    includeFonts: !!selectedTheme?.fonts?.length && includeFonts,
  });

  const handleSubmit = () => {
    if (!projectId || !brandThemeId || !description.trim() || isSubmitting) {
      return;
    }

    const includeFlags = buildIncludeFlags();

    if (mediaType === "video") {
      createAd.mutate(
        {
          brandThemeId,
          projectId,
          description: description.trim(),
          aspectRatio: aspectRatio as Veo3AspectRatio,
          durationSeconds,
          generateAudio,
          ...includeFlags,
          ...(referenceImages.length ? { referenceImages } : {}),
        },
        {
          onSuccess: (creation) => {
            setResultMediaType("video");
            setActiveJobId(creation.jobId);
          },
        },
      );
    } else {
      createPhoto.mutate(
        {
          brandThemeId,
          projectId,
          description: description.trim(),
          aspectRatio: aspectRatio as GeminiFlashImageAspectRatio,
          ...includeFlags,
          ...(referenceImages.length ? { referenceImages } : {}),
        },
        {
          onSuccess: (creation) => {
            setResultMediaType("photo");
            setActiveJobId(creation.jobId);
          },
        },
      );
    }
  };

  const canSubmit =
    !!projectId && !!brandThemeId && !!description.trim() && !isSubmitting;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Create</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate branded ads and photos from a project&apos;s brand theme.
        </p>
      </header>

      <div className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />

        <div className="flex flex-wrap gap-3">
          <ProjectPickerMenu projectId={projectId} onChange={setProjectId} />
          <BrandThemeSelector
            brandThemeId={brandThemeId}
            onChange={handleThemeChange}
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={MAX_DESCRIPTION_LENGTH}
            rows={4}
            placeholder={
              mediaType === "video"
                ? "Describe the ad you want to create…"
                : "Describe the photo you want to create…"
            }
            className="border-border bg-background-light text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl! border! p-3! text-sm! outline-none! focus:border-primary/50"
          />
          <p className="text-muted-foreground mt-1 text-right text-xs">
            {description.length} / {MAX_DESCRIPTION_LENGTH}
          </p>
        </div>

        <ReferenceImagesField
          images={referenceImages}
          onChange={setReferenceImages}
        />

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row">
          <Menu
            direction="up"
            trigger={<div className={TRIGGER_CLASS}>{aspectRatio}</div>}
            align="left"
          >
            <MenuItem className="m-0 w-[200px] p-0 sm:w-100">
              <AspectRatioSelectorComponent
                options={
                  mediaType === "video"
                    ? VEO3_ASPECT_RATIOS
                    : GEMINI_FLASH_IMAGE_ASPECT_RATIOS
                }
                value={aspectRatio}
                onChange={setAspectRatio}
              />
            </MenuItem>
          </Menu>

          {mediaType === "video" && (
            <Menu
              direction="up"
              trigger={
                <div className={TRIGGER_CLASS}>{durationSeconds}s</div>
              }
              align="left"
            >
              <MenuItem className="m-0 w-[200px] p-0 sm:w-100">
                <DurationSelector
                  options={VEO3_DURATION_SECONDS}
                  value={durationSeconds}
                  onChange={setDurationSeconds}
                />
              </MenuItem>
            </Menu>
          )}
        </div>

        <IncludeAssetsToggles
          theme={selectedTheme}
          includeLogo={includeLogo}
          includePrimaryColor={includePrimaryColor}
          includeFonts={includeFonts}
          onChangeLogo={setIncludeLogo}
          onChangePrimaryColor={setIncludePrimaryColor}
          onChangeFonts={setIncludeFonts}
        />

        {mediaType === "video" && (
          <div className="border-border/60 border-t pt-3">
            <GenerateAudioSelector
              label="Generate audio"
              value={generateAudio}
              onChange={setGenerateAudio}
            />
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-gradient-primary flex h-10 w-fit cursor-pointer items-center justify-center gap-2 self-end rounded-xl px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Create
              {/* Same `label | ⚡ N` shape as the generation and clipping
                  create buttons. */}
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

      {activeJobId && <CreationResult mediaType={resultMediaType} job={job} />}
    </div>
  );
}
