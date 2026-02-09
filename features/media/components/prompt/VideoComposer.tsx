import { forwardRef, useState, useImperativeHandle } from "react";
import {
  VideoResolution,
  VIDEO_RESOLUTIONS,
  VIDEO_ASPECT_RATIOS,
  MediaTypeEnum,
} from "../../types/media";
import { AspectRatioSelector } from "./selectors/AspectRatioSelector";
import { ResolutionSelector } from "./selectors/ResolutionSelector";
import PromptComposerFooter from "./PromptComposerFooter";
import {
  useGenerationCostQuery,
  useVideoGenerationMutation,
} from "@/features/generation/hooks/generation";
import { Textarea } from "@/components/ui/textarea";
import { useVideoGenerationStore } from "@/stores/useVideoGenerationStore";
import ImageSlots from "./ImageSlots";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface VideoComposerProps {
  isFocused: boolean;
}
export default function VideoComposer({ isFocused }: VideoComposerProps) {
  const router = useRouter();
  const {
    resolution,
    aspectRatio,
    prompt,
    durationSeconds,
    projectId,
    setResolution,
    setAspectRatio,
    setPrompt,
    referenceImages,
    setReferenceImages,
  } = useVideoGenerationStore();
  const { data: generation } = useGenerationCostQuery(
    resolution,
    MediaTypeEnum.VIDEO,
  );
  const videoGeneration = useVideoGenerationMutation();

  const handleGeneration = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    }
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      await videoGeneration.mutateAsync({
        prompt,
        aspectRatio,
        resolution,
        durationSeconds,
        referenceImages: referenceImages.filter(
          (img) => img !== null,
        ) as File[],
        // type: "video", // Function signature says GenerateVideoRequest, verify if type is needed.
        // Previous code had type: "video". GenerateVideoRequest doesn't seem to have type field based on step 354 diff?
        // Step 354: GenerateVideoRequest { prompt, projectId, referenceImages, durationSeconds, resolution, aspectRatio }. No type.
        projectId: projectId,
      });
      router.push(`/create/create-video`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className=" flex flex-row  gap-4">
        <ImageSlots
          imageSlots={referenceImages}
          onChange={setReferenceImages}
        />

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe what Video you want to create...`}
          className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>
      <PromptComposerFooter
        isGenerating={false}
        creditsCost={generation?.creditsCost ?? 0}
        isFocused={isFocused}
        disabled={!prompt.trim()}
        onGeneration={handleGeneration}
      >
        <ResolutionSelector
          options={VIDEO_RESOLUTIONS}
          value={resolution}
          onChange={(value) => {
            setResolution(value as VideoResolution);
          }}
        />
        <AspectRatioSelector
          options={VIDEO_ASPECT_RATIOS}
          value={aspectRatio}
          onChange={setAspectRatio}
        />
      </PromptComposerFooter>
    </>
  );
}
