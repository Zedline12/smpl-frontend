import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import ResolutionSelector from "@/features/generation/components/selectors/ResolutionSelector";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { Button } from "@/components/ui/button";
import {
  GrokImagineVideo15InputConst,
  IGrokImagineVideo15Input,
} from "@/features/generation/types/models/grok-imagine-video-1.5.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

export default function GrokImagineVideo15Composer({
  isFocused,
  editMode,
}: {
  isFocused: boolean;
  editMode?: boolean;
}) {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.GROK_IMAGINE_VIDEO_1_5
  ] as IGrokImagineVideo15Input;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.GROK_IMAGINE_VIDEO_1_5, key, value);

  const { prompt, images = [], duration, aspectRatio, resolution } = state;
  // The endpoint takes a single image, kept in an array for the provider.
  const imageUrl = images[0] ?? "";

  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <div className="flex flex-col gap-1 items-center">
          <span className="text-xs text-primary-foreground">Image</span>
          {imageUrl ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
              <img
                src={imageUrl}
                alt="Reference"
                className="w-full h-full object-cover"
              />
              <Button
                onClick={() => setField("images", [])}
                className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsMediaManagerOpen(true)}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
            >
              <ImageIcon className="w-5 h-5 text-muted group-hover:text-primary transition-colors mb-1" />
              <Plus className="w-3 h-3 text-muted group-hover:text-primary transition-colors" />
            </Button>
          )}
        </div>

        <Textarea
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Describe the video you want to generate..."
          className="flex-1 min-h-[100px] text-lg text-foreground placeholder:text-foreground/70 bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isMediaManagerOpen}
        onOpenChange={setIsMediaManagerOpen}
        selectedImage={imageUrl}
        onSelect={(imgs) => setField("images", imgs[0] ? [imgs[0]] : [])}
        maxSelections={1}
      />

      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
        <div className="grid grid-cols-2 sm:flex sm:flex-row w-full gap-2 sm:gap-0">
          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                {aspectRatio ?? "16:9"}
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[200px]">
              <AspectRatioSelectorComponent
                options={GrokImagineVideo15InputConst.aspectRatio}
                value={aspectRatio ?? "16:9"}
                onChange={(value: any) => setField("aspectRatio", value)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                    clipRule="evenodd"
                  />
                </svg>
                Duration: {duration}s
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[max-content]">
              <DurationSelector
                options={GrokImagineVideo15InputConst.duration}
                value={duration!}
                onChange={(v) => setField("duration", v)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={
              <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
                {resolution ?? "720p"}
              </div>
            }
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="p-0 m-0 sm:w-100 w-[max-content]">
              <ResolutionSelector
                options={GrokImagineVideo15InputConst.resolution as any}
                value={(resolution ?? "720p") as any}
                onChange={(v) => setField("resolution", v)}
              />
            </MenuItem>
          </Menu>
        </div>
      </PromptComposerFooter>
    </>
  );
}
