import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import { Plus, X, Video, Image as ImageIcon } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import KeepOriginalSoundToggle from "../../selectors/KeepOriginalSoundToggle";
import CharacterOrientationToggle from "../../selectors/CharacterOrientationToggle";
import { IKlingV3ProMotionControlInput } from "@/features/generation/types/models/kling-v3-pro-motion-control";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Button } from "@/components/ui/button";

interface KlingV3ProMotionControlComposerProps {
  isFocused: boolean;
}

export default function KlingV3ProMotionControlComposer({
  isFocused,
}: KlingV3ProMotionControlComposerProps) {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL
  ] as IKlingV3ProMotionControlInput;
  const setField = (key: string, value: any) =>
    setModelField(AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL, key, value);
  const {
    prompt,
    videoUrl,
    imageUrl,
    keepOriginalSound,
    characterOrientation,
  } = state;
  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <div className="flex flex-row gap-4 flex-wrap max-w-[400px]">
          {/* Image Selection */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">Character</span>
            {imageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <img
                  src={imageUrl}
                  alt="Ref"
                  className="w-full h-full object-cover"
                />
                <Button
                  onClick={() => setField("imageUrl", undefined)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsImageManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <ImageIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Button>
            )}
          </div>

          {/* Video Selection */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">Motion</span>
            {videoUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                <video
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => e.currentTarget.pause()}
                />
                <Button
                  onClick={() => setField("videoUrl", undefined)}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsVideoManagerOpen(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <Video className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
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
        open={isImageManagerOpen}
        onOpenChange={setIsImageManagerOpen}
        selectedImage={imageUrl}
        onSelect={(images) => setField("imageUrl", images[0])}
        maxSelections={1}
      />

      <MediaManagerDialog
        open={isVideoManagerOpen}
        onOpenChange={setIsVideoManagerOpen}
        selectedImage={videoUrl}
        onSelect={(videos) => {
          setField("videoUrl", videos[0]);
        }}
        maxSelections={1}
        mediaType="video"
      />

      <PromptComposerFooter isFocused={isFocused}>
        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 capitalize">
              Orientation: {characterOrientation || "image"}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0 bg-red-500 m-0 sm:w-100 w-[200px]">
            <CharacterOrientationToggle
              value={characterOrientation}
              onChange={(value) => setField("characterOrientation", value)}
            />
          </MenuItem>
        </Menu>

        <Menu
          direction="up"
          trigger={
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20">
              Audio: {keepOriginalSound ? "Original" : "None"}
            </div>
          }
          align="left"
        >
          <MenuItem className="p-0  m-0 sm:w-100 w-[240px]">
            <KeepOriginalSoundToggle
              value={keepOriginalSound || false}
              onChange={(v) => setField("keepOriginalSound", v)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
