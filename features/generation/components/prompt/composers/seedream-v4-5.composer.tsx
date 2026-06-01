import { useState } from "react";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { ISeedreamV45Input, SeedreamV45OptionsConst } from "@/features/generation/types/models/seedream-v4-5.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

export default function SeedreamV45Composer({ isFocused, editMode }: { isFocused: boolean; editMode?: boolean }) {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const { states, setField: setModelField } = useAiModelStore();
  const state = states[AiModelsEnum.SEEDREAM_V4_5] as ISeedreamV45Input;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.SEEDREAM_V4_5, key, value);
  const { prompt, images = [], aspectRatio } = state;

  const removeReferenceImage = (url: string) => {
    setField("images", images.filter((img) => img !== url));
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
          placeholder="Describe what image you want to create..."
          className="flex-1 min-h-[100px] text-lg text-white bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isMediaManagerOpen}
        onOpenChange={setIsMediaManagerOpen}
        selectedImages={images}
        onSelect={(imgs) => setField("images", imgs)}
      />

      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              {aspectRatio ?? "1:1"}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[200px]">
            <AspectRatioSelectorComponent
              options={SeedreamV45OptionsConst.aspectRatio as any}
              value={aspectRatio ?? "1:1"}
              onChange={(value: any) => setField("aspectRatio", value)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
