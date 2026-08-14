import { useState } from "react";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import QualitySelector from "@/features/generation/components/selectors/QualitySelector";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import {
  GPT_IMAGE_2_MAX_IMAGES,
  GptImage2OptionsConst,
  IGptImage2Input,
} from "@/features/generation/types/models/gpt-image-2.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

export default function GptImage2Composer({
  isFocused,
  editMode,
}: {
  isFocused: boolean;
  editMode?: boolean;
}) {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[AiModelsEnum.GPT_IMAGE_2] as IGptImage2Input;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.GPT_IMAGE_2, key, value);
  const { prompt, images = [], aspectRatio, quality } = state;

  const removeReferenceImage = (url: string) => {
    setField(
      "images",
      images.filter((img) => img !== url),
    );
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className="flex flex-row items-start gap-4">
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
          {images.length < GPT_IMAGE_2_MAX_IMAGES && (
            <button
              onClick={() => setIsMediaManagerOpen(true)}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex items-center justify-center transition-all group"
            >
              <Plus className="w-6 h-6 text-muted group-hover:text-primary transition-colors" />
            </button>
          )}
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Describe what image you want to create..."
          className="flex-1 min-h-[100px] text-lg text-foreground placeholder:text-foreground/70 bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isMediaManagerOpen}
        onOpenChange={setIsMediaManagerOpen}
        selectedImages={images}
        onSelect={(imgs) => setField("images", imgs)}
        maxSelections={GPT_IMAGE_2_MAX_IMAGES}
      />

      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
        <div className="grid grid-cols-2 sm:flex sm:flex-row w-full gap-2 sm:gap-0">
          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                {aspectRatio ?? "auto"}
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[200px]">
              <AspectRatioSelectorComponent
                options={GptImage2OptionsConst.aspectRatio}
                value={aspectRatio ?? "auto"}
                onChange={(value: any) => setField("aspectRatio", value)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white capitalize hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                Quality: {quality ?? "auto"}
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[240px]">
              <QualitySelector
                options={GptImage2OptionsConst.quality}
                value={quality ?? "auto"}
                onChange={(v) => setField("quality", v)}
              />
            </MenuItem>
          </Menu>
        </div>
      </PromptComposerFooter>
    </>
  );
}
