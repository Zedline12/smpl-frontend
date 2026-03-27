import { useState } from "react";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { ResolutionSelector } from "../selectors/ResolutionSelector";
import {
  GEMINI_FLASH_IMAGE_RESOLUTIONS,
  GEMINI_FLASH_IMAGE_ASPECT_RATIOS,
  GeminiFlashImageInput,
} from "@/features/generation/types/models/gemini-flash-image.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

interface GeminiFlashImageComposerProps {
  isFocused: boolean;
}

export default function GeminiFlashImageComposer({
  isFocused,
}: GeminiFlashImageComposerProps) {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();

  const state = states[
    AiModelsEnum.GEMINI_FLASH_IMAGE
  ] as GeminiFlashImageInput;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.GEMINI_FLASH_IMAGE, key, value);
  const { resolution, aspectRatio, prompt, images } = state;
  const removeReferenceImage = (url: string) => {
    setField(
      "images",
      images.filter((img) => img !== url),
    );
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className=" flex flex-row items-start gap-4">
        <div className="flex flex-row gap-2 flex-wrap max-w-[400px]">
          {images.map((url, index) => (
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
          {images.length < 4 && (
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
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder={`Describe what Image you want to create...`}
          className="flex-1 min-h-[100px] text-lg text-white  bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isMediaManagerOpen}
        onOpenChange={setIsMediaManagerOpen}
        selectedImages={images}
        onSelect={(images) => setField("images", images)}
      />

      <PromptComposerFooter isFocused={isFocused}>
        <ResolutionSelector
          options={GEMINI_FLASH_IMAGE_RESOLUTIONS as any}
          value={resolution}
          onChange={(value: any) => {
            setField("resolution", value);
          }}
        />
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              {aspectRatio}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0  m-0 sm:w-100 w-[200px]">
            <AspectRatioSelectorComponent
              options={GEMINI_FLASH_IMAGE_ASPECT_RATIOS as any}
              value={aspectRatio}
              onChange={(value: any) => setField("aspectRatio", value)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
