import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import { Plus, X, Image as ImageIcon } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import { Button } from "@/components/ui/button";
import { IKlingV3ImageToVideoInput, KlingV3ImageToVideoInputConst } from "@/features/generation/types/models/kling-v3-image-to-video.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

interface KlingV3ImageToVideoComposerProps {
  isFocused: boolean;
}

export default function KlingV3ImageToVideoComposer({
  isFocused,
}: KlingV3ImageToVideoComposerProps) {
  const [isStartImageManagerOpen, setIsStartImageManagerOpen] = useState(false);
  const [isEndImageManagerOpen, setIsEndImageManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO
  ] as IKlingV3ImageToVideoInput;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO, key, value);
    
  const {
    prompt,
    startImageUrl,
    endImageUrl,
    duration,
    generateAudio,
  } = state;
  
  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <div className="flex flex-row gap-4 flex-wrap max-w-[400px]">
          {/* Start Image Selection */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">Start Image</span>
            {startImageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <img
                  src={startImageUrl}
                  alt="Start"
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => setField("startImageUrl", "")}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsStartImageManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            )}
          </div>

          {/* End Image Selection */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">End Image</span>
            {endImageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <img
                  src={endImageUrl}
                  alt="End"
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => setField("endImageUrl", undefined)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsEndImageManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder={`Describe the motion and scene details...`}
          className="flex-1 min-h-[100px] text-lg text-white bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isStartImageManagerOpen}
        onOpenChange={setIsStartImageManagerOpen}
        selectedImage={startImageUrl}
        onSelect={(images) => setField("startImageUrl", images[0])}
        maxSelections={1}
      />

      <MediaManagerDialog
        open={isEndImageManagerOpen}
        onOpenChange={setIsEndImageManagerOpen}
        selectedImage={endImageUrl}
        onSelect={(images) => setField("endImageUrl", images[0])}
        maxSelections={1}
      />

      <PromptComposerFooter isFocused={isFocused}>
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
                options={KlingV3ImageToVideoInputConst.duration}
                value={duration}
                onChange={(v) => setField("duration", v)}
              />
          </MenuItem>
        </Menu>

        <Menu
          direction="up"
          trigger={
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center">
              Audio: {generateAudio ? "Yes" : "No"}
            </div>
          }
          align="left"
          menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
        >
          <MenuItem className="p-0 m-0 sm:w-100 w-[240px]">
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
