import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { Menu, MenuItem } from "@/components/menu";
import { Plus, X, Video, Image as ImageIcon } from "lucide-react";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";
import ResolutionSelector from "@/features/generation/components/selectors/ResolutionSelector";
import {
  GENJUTSU_MOTION_TRANSFER_MAX_IMAGES,
  GenjutsuMotionTransferInputConst,
  IGenjutsuMotionTransferInput,
} from "@/features/generation/types/models/higgsfield-genjutsu-motion-transfer.type";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";

interface GenjutsuMotionTransferComposerProps {
  isFocused: boolean;
  editMode?: boolean;
}

export default function GenjutsuMotionTransferComposer({
  isFocused,
  editMode,
}: GenjutsuMotionTransferComposerProps) {
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const [isVideoManagerOpen, setIsVideoManagerOpen] = useState(false);

  const { states, setField: setModelField } = useAiModelStore();
  const state = states[
    AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER
  ] as IGenjutsuMotionTransferInput;
  const setField = (key: keyof IGenjutsuMotionTransferInput, value: unknown) =>
    setModelField(AiModelsEnum.HIGGSFIELD_GENJUTSU_MOTION_TRANSFER, key, value);
  const { prompt, videoUrl, images = [], resolution } = state;

  const removeReferenceImage = (url: string) => {
    setField(
      "images",
      images.filter((img) => img !== url),
    );
  };

  return (
    <>
      <div
        style={{ zIndex: 1 }}
        className="flex flex-col sm:flex-row items-start gap-4"
      >
        <div className="flex flex-row gap-4 flex-wrap max-w-[400px]">
          {/* Source video */}
          <div className="flex flex-col gap-1 items-center">
            <span className="text-xs text-primary-foreground">Video</span>
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
                <button
                  onClick={() => setField("videoUrl", "")}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsVideoManagerOpen(true)}
                title="Source video, 4-30s (longer videos are trimmed to 30s)"
                className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
              >
                <Video className="w-5 h-5 text-muted group-hover:text-primary transition-colors mb-1" />
                <Plus className="w-3 h-3 text-muted group-hover:text-primary transition-colors" />
              </button>
            )}
            <span className="text-[10px] text-muted-foreground">4-30s</span>
          </div>

          {/* Reference images */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-primary-foreground">
              References ({images.length}/{GENJUTSU_MOTION_TRANSFER_MAX_IMAGES})
            </span>
            <div className="flex flex-row gap-2 flex-wrap max-w-[280px]">
              {images.map((url, index) => (
                <div
                  key={url + index}
                  className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group bg-white/5"
                >
                  <img
                    src={url}
                    alt="Ref"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeReferenceImage(url)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < GENJUTSU_MOTION_TRANSFER_MAX_IMAGES && (
                <button
                  onClick={() => setIsImageManagerOpen(true)}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/50 hover:bg-white/5 flex flex-col items-center justify-center transition-all group"
                >
                  <ImageIcon className="w-5 h-5 text-muted group-hover:text-primary transition-colors mb-1" />
                  <Plus className="w-3 h-3 text-muted group-hover:text-primary transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>

        <Textarea
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          placeholder="Optional: describe what to swap (characters, location, style)..."
          className="flex-1 min-h-[100px] text-lg text-foreground placeholder:text-foreground/70 bg-transparent border-none focus:ring-0 resize-none outline-none pt-2"
        />
      </div>

      <MediaManagerDialog
        open={isImageManagerOpen}
        onOpenChange={setIsImageManagerOpen}
        selectedImages={images}
        onSelect={(imgs) => setField("images", imgs)}
        maxSelections={GENJUTSU_MOTION_TRANSFER_MAX_IMAGES}
      />

      <MediaManagerDialog
        open={isVideoManagerOpen}
        onOpenChange={setIsVideoManagerOpen}
        selectedImage={videoUrl}
        onSelect={(videos) => setField("videoUrl", videos[0] ?? "")}
        maxSelections={1}
        mediaType="video"
      />

      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
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
              options={GenjutsuMotionTransferInputConst.resolution}
              value={resolution ?? "720p"}
              onChange={(v) => setField("resolution", v)}
            />
          </MenuItem>
        </Menu>
      </PromptComposerFooter>
    </>
  );
}
