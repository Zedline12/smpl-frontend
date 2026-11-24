"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUp, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "@/features/generation/hooks/generation";
import {
  GenerationTypeEnum,
  ModelsValidatorSchemaMap,
} from "@/features/generation/types/generation";
import {
  AdsStudioInputConst,
  IAdsStudioInput,
} from "@/features/generation/types/models/ads-studio.type";
import { useDefaultProject } from "@/features/projects/hooks/use-default-project";
import { withStyle } from "@/features/styles/styles";
import { cn } from "@/lib/utils";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import { useAvatarsQuery, useProductsQuery } from "../../hooks/use-ads-library";
import { useAdsSelectionStore } from "../../stores/useAdsSelectionStore";
import { brandToAdInput, uniqueUrls } from "../../utils/ad-input";
import { ComposerChip } from "./ComposerChip";
import {
  AvatarPicker,
  BrandPicker,
  ProductPicker,
  SettingsPicker,
  StylePicker,
  useReadyBrands,
} from "./Pickers";

export const ADS_MODEL = AiModelsEnum.SMPL_ADS_STUDIO;
const c = AdsStudioInputConst;

/**
 * The Ads Studio prompt box: a brief plus Brand / Product / Avatar / Style picks.
 * Picks live in useAdsSelectionStore and are merged into the model's input (images
 * and brand) only when generating, so the stored settings stay the user's own.
 */
export function AdsComposer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { model, setMediaType, setModel, projectId, styleId, setStyleId } =
    useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const state = states[ADS_MODEL] as IAdsStudioInput;
  const set = (key: keyof IAdsStudioInput, value: unknown) =>
    setField(ADS_MODEL, key, value);

  const { productIds, avatarId, brandId } = useAdsSelectionStore();
  const { data: products = [] } = useProductsQuery();
  const { data: avatars = [] } = useAvatarsQuery();
  const brands = useReadyBrands();
  const brand = brands.find((b) => b.id === brandId);
  const avatar = avatars.find((a) => a.id === avatarId);
  const pickedProducts = products.filter((p) => productIds.includes(p.id));

  const { data: cost } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const [imagesOpen, setImagesOpen] = useState(false);
  useDefaultProject(!!user);

  // This page always works on the Ads Studio model (Recreate also lands here).
  useEffect(() => {
    if (model === ADS_MODEL) return;
    // setMediaType resets the model to the type's default, so set the model after it.
    setMediaType(GenerationTypeEnum.IMAGE);
    setModel(ADS_MODEL);
  }, [model, setMediaType, setModel]);

  if (model !== ADS_MODEL || !state) return <div className="h-40" />;

  const extraImages = state.images ?? [];
  const allImages = uniqueUrls([
    ...pickedProducts.flatMap((p) => p.images),
    avatar?.imageUrl,
    brand?.logoUrl,
    ...extraImages,
  ]);
  const images = allImages.slice(0, c.maxImages);
  const overLimit = allImages.length > c.maxImages;
  const input: IAdsStudioInput = {
    ...state,
    images,
    // A picked brand wins; otherwise keep a brand that came in with Recreate.
    brand: brand ? brandToAdInput(brand) : state.brand,
  };
  const styled = withStyle(ADS_MODEL, input, styleId);
  const valid = ModelsValidatorSchemaMap[ADS_MODEL].safeParse(
    styled.forValidation,
  ).success;
  const canGenerate = valid && !!projectId && !generation.isPending;

  const generate = () => {
    if (!canGenerate) return;
    generation.mutate(
      {
        model: ADS_MODEL,
        mediaType: GenerationTypeEnum.IMAGE,
        projectId,
        input: styled.input,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
          toast.success(
            `Making ${state.batchSize} ${state.batchSize === 1 ? "ad" : "ads"}…`,
            {
              action: {
                label: "View in All media",
                onClick: () => router.push("/ads-studio/media"),
              },
            },
          );
        },
      },
    );
  };

  return (
    <div className="w-full rounded-[22px] border border-white/10 bg-[#111115]/90 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl focus-within:border-white/20">
      {extraImages.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-1">
          {extraImages.map((url) => (
            <span
              key={url}
              className="group relative size-12 overflow-hidden rounded-lg border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async" src={url} alt="" className="size-full object-cover" />
              <button
                type="button"
                aria-label="Remove image"
                onClick={() =>
                  set(
                    "images",
                    extraImages.filter((u) => u !== url),
                  )
                }
                className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <X className="size-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <textarea
        value={state.prompt}
        onChange={(e) => set("prompt", e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
        }}
        maxLength={c.maxPromptLength}
        rows={3}
        aria-label="Ad brief"
        placeholder={
          'Describe your ad, e.g. "Summer sale on our iced coffee, bright and playful, 20% off this week"…'
        }
        className="w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/35"
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:w-auto sm:flex-1">
          <ComposerChip
            icon={ImagePlus}
            label="Images"
            aria-label="Add reference images"
            onClick={() => setImagesOpen(true)}
            value={extraImages.length ? `${extraImages.length}` : undefined}
            className="px-2"
          />
          <StylePicker styleId={styleId} onChange={setStyleId} />
          <ProductPicker />
          <AvatarPicker />
          <BrandPicker fallbackName={!brand ? state.brand?.name : undefined} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <SettingsPicker state={state} set={set} />
          <span className="text-xs text-white/45 tabular-nums">
            {cost?.creditsCost ?? 0} credits
          </span>
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            aria-label={`Generate ${state.batchSize} ${state.batchSize === 1 ? "ad" : "ads"}`}
            className="bg-primary hover:bg-primary/90 flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-35"
          >
            {generation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="size-4" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      {(overLimit || allImages.length >= c.maxImages - 2) &&
        allImages.length > 0 && (
          <p
            className={cn(
              "mt-2 px-2 text-xs",
              overLimit ? "text-amber-300/90" : "text-white/40",
            )}
          >
            {overLimit
              ? `Only the first ${c.maxImages} of ${allImages.length} images are used; pick fewer products or remove some images.`
              : `${allImages.length}/${c.maxImages} reference images`}
          </p>
        )}

      <MediaManagerDialog
        open={imagesOpen}
        onOpenChange={setImagesOpen}
        selectedImages={extraImages}
        onSelect={(urls) => set("images", urls.slice(0, c.maxImages))}
        maxSelections={c.maxImages}
      />
    </div>
  );
}
