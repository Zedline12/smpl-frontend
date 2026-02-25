"use client";
import CreateVideoParameter from "@/features/generation/components/CreateVideoParameter";
import VideoGenerationInput from "@/features/generation/components/inputs/VideoGenerationInput";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import { useVideoGenerationMutation } from "@/features/generation/hooks/generation";
import { useVideoGenerationStore } from "@/stores/useVideoGenerationStore";
import { toast } from "sonner";
import PromptComposer from "@/features/media/components/prompt/PromptComposer";

export default function CreateVideoPage() {
  const videoGeneration = useVideoGenerationMutation();

  const {
    prompt,
    aspectRatio,
    resolution,
    durationSeconds,
    referenceImages,
    projectId,
  } = useVideoGenerationStore();

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
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="md:grid hidden  h-full  grid-cols-3 gap-6 text-foreground">
        <div className="col-span-1 ">
          <CreateVideoParameter />
        </div>
        <div className="relative col-span-2 px-5   flex flex-col gap-2">
          <div className="h-[700px]"> 
            <MediaExplorer />
          </div>

          <div className="absolute border border-neutral-800 rounded-lg p-5 bottom-0 left-0 w-full">
            <VideoGenerationInput onGeneration={handleGeneration} />
          </div>
        </div>
      </div>
      <div className="p-5 md:hidden  block h-full grid grid-cols-1 gap-6 text-foreground">
        <div className="col-span-1 h-[600px] ">
          <MediaExplorer />
        </div>
        <section className=" w-full   z-10 flex items-center justify-center">
          <PromptComposer />
        </section>
      </div>
    </>
  );
}
