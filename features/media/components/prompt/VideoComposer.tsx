import { forwardRef, useState, useImperativeHandle } from "react";
import {
  VideoResolution,
  VIDEO_RESOLUTIONS,
  VIDEO_ASPECT_RATIOS,
  MediaTypeEnum,
  IMAGE_RESOLUTIONS,
  ImageResolution,
  VIDEO_DURATION_SECONDS,
  VideoDuration,
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import { MediaManagerDialog } from "./MediaManagerDialog";
import { Plus, X } from "lucide-react";

interface VideoComposerProps {
  isFocused: boolean;
}

export default function VideoComposer({ isFocused }: VideoComposerProps) {
  const router = useRouter();
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
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
    setDurationSeconds,
    setReferenceImages,
  } = useVideoGenerationStore();
  const { data: generation } = useGenerationCostQuery(
    resolution,
    MediaTypeEnum.VIDEO,
  );
  const videoGeneration = useVideoGenerationMutation();
  const isDurationForced =
    resolution === "1080p" || resolution === "4k" || referenceImages.length > 0;

  if (isDurationForced && durationSeconds !== 8) {
    setDurationSeconds(8);
  }

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
        referenceImages,
        projectId: projectId,
      });
      router.push(`/create/create-video`);
    } catch (e) {
      console.error(e);
    }
  };

  const removeReferenceImage = (url: string) => {
    setReferenceImages(referenceImages.filter((img) => img !== url));
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className=" flex flex-row items-start gap-4">
        <div className="flex flex-row gap-2 flex-wrap max-w-[400px]">
          {referenceImages.map((url, index) => (
            <div
              key={url + index}
              className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5"
            >
              <img src={url} alt="Ref" className="w-full h-full object-cover" />
              <button
                onClick={() => removeReferenceImage(url)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {referenceImages.length < 4 && (
            <button
              onClick={() => setIsMediaManagerOpen(true)}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          )}
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`Describe what Video you want to create...`}
          className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isMediaManagerOpen}
        onOpenChange={setIsMediaManagerOpen}
        selectedImages={referenceImages}
        onSelect={setReferenceImages}
      />
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
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                  clipRule="evenodd"
                />
              </svg>

              {durationSeconds}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0  m-0 sm:w-100 w-[200px]">
            <DurationSelector
              options={VIDEO_DURATION_SECONDS}
              value={durationSeconds}
              onChange={(v) => setDurationSeconds(v as VideoDuration)}
              disabled={isDurationForced}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
