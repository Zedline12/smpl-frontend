import {
  ImageResolution,
  ImageAspectRatio,
  IMAGE_RESOLUTIONS,
  IMAGE_ASPECT_RATIOS,
  MediaTypeEnum,
} from "../../types/media";
import PromptComposerFooter from "./PromptComposerFooter";
import { useGenerationCostQuery, useImageGenerationMutation } from "@/features/generation/hooks/generation";
import { Textarea } from "@/components/ui/textarea";
import ImageSlots from "./ImageSlots";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import { Menu, MenuItem } from "@/components/menu";
import ResolutionSelectorComponent from "@/features/generation/components/selectors/ResolutionSelector";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface ImageComposerProps {
  isFocused: boolean;
}
export default function ImageComposer({
  isFocused,
}: ImageComposerProps) {
  const router=useRouter()
  const {
    resolution,
    aspectRatio,
    prompt,
    projectId,
    setResolution,
    setAspectRatio,
    setPrompt,
    referenceImages,
    setReferenceImages,
  } = useImageGenerationStore();
  const { data: generation } = useGenerationCostQuery(
    resolution,
    MediaTypeEnum.IMAGE,
  );
    const imageGeneration = useImageGenerationMutation();
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
      console.log({
        prompt,
        projectId,
        aspectRatio,
        resolution,
        referenceImages: referenceImages.filter(
          (img) => img !== null,
        ) as File[],
      });
      await imageGeneration.mutateAsync({
        prompt,
        projectId,
        aspectRatio,
        resolution,
        referenceImages: referenceImages.filter(
          (img) => img !== null,
        ) as File[],
      });
      console.log("mutated");
      router.push(`/create/create-image`);
    } catch (error) {
      console.error(error);
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
          placeholder={`Describe what Photo you want to create...`}
          className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>
      <PromptComposerFooter
        isGenerating={imageGeneration.isPending}
        creditsCost={generation?.creditsCost ?? 0}
        isFocused={isFocused}
        disabled={!prompt.trim()}
        onGeneration={handleGeneration}
      >
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
                  d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                  clipRule="evenodd"
                />
              </svg>
              {resolution.toUpperCase()}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 bg-red-500 m-0 sm:w-100 w-[200px]">
            <ResolutionSelectorComponent
              options={IMAGE_RESOLUTIONS}
              value={resolution}
              onChange={(value) => setResolution(value as ImageResolution)}
            />
          </MenuItem>
        </Menu>
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              {aspectRatio}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 bg-red-500 m-0 sm:w-100 w-[200px]">
            <AspectRatioSelectorComponent
              options={IMAGE_ASPECT_RATIOS}
              value={aspectRatio}
              onChange={(value) => setAspectRatio(value as ImageAspectRatio)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
