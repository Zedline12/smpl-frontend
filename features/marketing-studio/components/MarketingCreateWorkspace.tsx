"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";
import { Menu, MenuItem } from "@/components/menu";
import { Textarea } from "@/components/ui/textarea";
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
import { BrandTheme, getThemeFonts } from "@/features/brand-themes/types";
import { BrandThemeSelector } from "./BrandThemeSelector";
import { ProjectPickerMenu } from "./ProjectPickerMenu";
import { MediaTypeToggle } from "./MediaTypeToggle";
import { IncludeAssetsToggles } from "./IncludeAssetsToggles";
import { ReferenceImagesField } from "./ReferenceImagesField";
import {
  useCreateMarketingAdMutation,
  useCreateMarketingPhotoMutation,
  useMarketingCostQuery,
} from "../hooks/use-marketing-studio";
import { MarketingStudioMediaType, MAX_DESCRIPTION_LENGTH } from "../types";

const MY_CREATIONS_HREF = "/marketing-studio/my-creations";

// Same pill the prompt composers use for their option menus.
const TRIGGER_CLASS =
  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center";

export function MarketingCreateWorkspace() {
  const router = useRouter();
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

  const createAd = useCreateMarketingAdMutation();
  const createPhoto = useCreateMarketingPhotoMutation();

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
    if (!getThemeFonts(theme).length) setIncludeFonts(false);
  };

  const handleMediaTypeChange = (next: MarketingStudioMediaType) => {
    setMediaType(next);
    // The two models don't share an aspect-ratio set (Veo 3 is 16:9/9:16 only).
    setAspectRatio(next === "video" ? "16:9" : "1:1");
  };

  const buildIncludeFlags = () => ({
    includeLogo: !!selectedTheme?.logoUrl && includeLogo,
    includePrimaryColor: !!selectedTheme?.primaryColor && includePrimaryColor,
    includeFonts: getThemeFonts(selectedTheme).length > 0 && includeFonts,
  });

  const includedAssetCount = Object.values(buildIncludeFlags()).filter(
    Boolean,
  ).length;

  const goToMyCreations = () => router.push(MY_CREATIONS_HREF);

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
        { onSuccess: goToMyCreations },
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
        { onSuccess: goToMyCreations },
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

      <div className="flex flex-col gap-3">
        <MediaTypeToggle value={mediaType} onChange={handleMediaTypeChange} />

        {/* Composer-style card: references + prompt on top, options below. */}
        <div className="rounded-2xl border border-white/10 bg-black/50 shadow-xl backdrop-blur-lg">
          <div className="p-2">
            <div className="flex flex-row items-start gap-4">
              <ReferenceImagesField
                images={referenceImages}
                onChange={setReferenceImages}
              />

              <div className="flex-1">
                <Textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder={
                    mediaType === "video"
                      ? "Describe the ad you want to create..."
                      : "Describe the photo you want to create..."
                  }
                  className="text-foreground placeholder:text-foreground/70 min-h-[100px] w-full resize-none border-none bg-transparent pt-2 text-lg outline-none focus:ring-0"
                />
                <p className="text-muted-foreground text-right text-[11px]">
                  {description.length} / {MAX_DESCRIPTION_LENGTH}
                </p>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <ProjectPickerMenu
                  projectId={projectId}
                  onChange={setProjectId}
                />
                <BrandThemeSelector
                  brandThemeId={brandThemeId}
                  onChange={handleThemeChange}
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

                  {mediaType === "video" && (
                    <Menu
                      direction="up"
                      trigger={
                        <div className={TRIGGER_CLASS}>
                          Audio: {generateAudio ? "Yes" : "No"}
                        </div>
                      }
                      align="left"
                    >
                      <MenuItem className="m-0 w-[240px] p-0">
                        <GenerateAudioSelector
                          value={generateAudio}
                          onChange={setGenerateAudio}
                        />
                      </MenuItem>
                    </Menu>
                  )}

                  <Menu
                    direction="up"
                    trigger={
                      <div className={TRIGGER_CLASS}>
                        <Palette className="size-4 shrink-0" />
                        Brand assets
                        {includedAssetCount > 0 && ` · ${includedAssetCount}`}
                      </div>
                    }
                    align="left"
                  >
                    <MenuItem className="m-0 w-[260px] p-3 hover:bg-transparent">
                      <IncludeAssetsToggles
                        theme={selectedTheme}
                        includeLogo={includeLogo}
                        includePrimaryColor={includePrimaryColor}
                        includeFonts={includeFonts}
                        onChangeLogo={setIncludeLogo}
                        onChangePrimaryColor={setIncludePrimaryColor}
                        onChangeFonts={setIncludeFonts}
                      />
                    </MenuItem>
                  </Menu>
                </div>
              </div>

              {/* Glassy glow Create button — same as the prompt composer's. */}
              <div className="group/btn relative self-end sm:self-auto">
                <div
                  className={`pointer-events-none absolute -inset-2 rounded-full blur-xl transition-opacity duration-500 ${
                    canSubmit
                      ? "opacity-50 group-hover/btn:opacity-80"
                      : "opacity-[0.07]"
                  }`}
                  style={{ background: "var(--gradient-create)" }}
                />
                <div
                  className={`pointer-events-none absolute -inset-0.5 rounded-full blur-sm transition-opacity duration-300 ${
                    canSubmit
                      ? "opacity-80 group-hover/btn:opacity-100"
                      : "opacity-[0.12]"
                  }`}
                  style={{ background: "var(--gradient-create)" }}
                />
                <div
                  className={`relative rounded-full p-px transition-transform duration-200 ${
                    canSubmit ? "group-hover/btn:scale-[1.03]" : ""
                  }`}
                  style={{ background: "var(--gradient-create)" }}
                >
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={`relative flex cursor-pointer items-center rounded-full px-4 py-2 text-sm font-semibold backdrop-blur-md transition-colors duration-200 disabled:cursor-not-allowed ${
                      canSubmit
                        ? "bg-black/65 text-white group-hover/btn:bg-black/45"
                        : "bg-black/80 text-white/30"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Starting...
                      </div>
                    ) : (
                      <div className="flex flex-row items-center gap-1">
                        <span>Generate</span>
                        <span className="mx-0.5 text-white/40">|</span>
                        <span className="flex flex-row items-center opacity-60">
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
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
