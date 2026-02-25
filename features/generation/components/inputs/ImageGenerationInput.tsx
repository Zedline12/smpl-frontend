import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MediaTypeEnum } from "@/features/media/types/media";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import { useGenerationCostQuery } from "../../hooks/generation";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "@/features/media/components/prompt/MediaManagerDialog";
import { useState } from "react";
interface ImageGenerationInputProps {
  onGeneration: () => void;
}
export default function ImageGenerationInput({
  onGeneration,
}: ImageGenerationInputProps) {
  const { prompt, setPrompt, referenceImages, setReferenceImages, resolution } =
    useImageGenerationStore();

  const { data: generation } = useGenerationCostQuery(
    resolution,
    MediaTypeEnum.IMAGE,
  );
   const removeReferenceImage = (url: string) => {
    setReferenceImages(referenceImages.filter((img) => img !== url));
  };
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  return (
    <div className=" flex flex-row  gap-4">
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
                  {referenceImages.length < 15 && (
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
        placeholder={`Describe what Photo you want to create...`}
        className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
      />
       <MediaManagerDialog
              open={isMediaManagerOpen}
              onOpenChange={setIsMediaManagerOpen}
              selectedImages={referenceImages}
              onSelect={setReferenceImages}
            />
      <Button
        type="button"
        variant={"primary"}
        className="text-sm p-3 transition-all duration-300 ease-in-out"
        onClick={onGeneration}
        disabled={prompt.length === 0}
      >
        <>
          <div className="flex flex-row items-center gap-1">
            <div>Create</div>
            <div className="text-sm text-white/50">|</div>
            <div className="flex flex-row items-center opacity-50 ">
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

              {generation?.creditsCost ?? 0}
            </div>
          </div>
        </>
      </Button>
    </div>
  );
}
