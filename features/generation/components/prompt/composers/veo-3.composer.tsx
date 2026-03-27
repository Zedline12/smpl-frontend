import { useState } from "react";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import { Plus, X } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { ResolutionSelector } from "../selectors/ResolutionSelector";
import {
  VEO3_ASPECT_RATIOS,
  VEO3_RESOLUTIONS,
  VEO3_DURATION_SECONDS,
  Veo3Input,
} from "@/features/generation/types/models/veo-3.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

interface Veo3ComposerProps {
  isFocused: boolean;
}

export default function Veo3Composer({ isFocused }: Veo3ComposerProps) {
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[AiModelsEnum.VEO_3] as Veo3Input;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.VEO_3, key, value);
  const {
    resolution,
    aspectRatio,
    prompt,
     images,
    durationSeconds,
    generateAudio,
  } = state;

  const isDurationForced =
    resolution === "1080p" || resolution === "4k" || images.length > 0;

  if (isDurationForced && durationSeconds !== 8) {
    setField("durationSeconds", 8);
  }

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
          placeholder={`Describe what Video you want to create...`}
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
          options={VEO3_RESOLUTIONS as any}
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
        >
          <MenuItem className="p-0 bg-red-500 m-0 sm:w-100 w-[200px]">
            <AspectRatioSelectorComponent
              options={VEO3_ASPECT_RATIOS as any}
              value={aspectRatio}
              onChange={(value: any) => setField("aspectRatio", value)}
            />
          </MenuItem>
        </Menu>

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
              options={VEO3_DURATION_SECONDS as any}
              value={durationSeconds}
              onChange={(v) => setField("durationSeconds", v)}
              disabled={isDurationForced}
            />
          </MenuItem>
        </Menu>

        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              Audio
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 bg-red-500 m-0 sm:w-100 w-[200px]">
            <GenerateAudioSelector
              value={generateAudio}
              onChange={(v) => setField("generateAudio", v)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
