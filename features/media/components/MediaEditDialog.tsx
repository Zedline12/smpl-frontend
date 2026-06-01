"use client";

import { useEffect } from "react";
import { Media } from "@/features/media/types/media";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAiGenerationControlStore, useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum, AUDIO_MODELS, IMAGE_MODELS, VIDEO_MODELS } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import { useEditGenerationMutation } from "@/features/generation/hooks/generation";
import { useQueryClient } from "@tanstack/react-query";
import ModelSelector from "@/features/generation/components/prompt/selectors/ModelSelector";
import GeminiFlashImageComposer from "@/features/generation/components/prompt/composers/gemini-flash-image.composer";
import KlingO3ImageComposer from "@/features/generation/components/prompt/composers/kling-03-image.composer";
import Veo3Composer from "@/features/generation/components/prompt/composers/veo-3.composer";
import KlingV3ProMotionControlComposer from "@/features/generation/components/prompt/composers/kling-v3-pro-motion-control";
import KlingV3ImageToVideoComposer from "@/features/generation/components/prompt/composers/kling-v3-image-to-video.composer";
import KlingV3TextToVideoComposer from "@/features/generation/components/prompt/composers/kling-v3-text-to-video.composer";
import ElevenLabsV3Composer from "@/features/generation/components/prompt/composers/eleven-labs-v3.composer";
import SeedreamV45Composer from "@/features/generation/components/prompt/composers/seedream-v4-5.composer";
import Seedance20Composer from "@/features/generation/components/prompt/composers/seedance-2.0.composer";

interface MediaEditDialogProps {
  media: Media;
  open: boolean;
  onClose: () => void;
}

export function MediaEditDialog({ media, open, onClose }: MediaEditDialogProps) {
  const { model, mediaType, setModel, setMediaType } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const editMutation = useEditGenerationMutation();
  const queryClient = useQueryClient();

  // Pre-populate the store with this media's model + input when the dialog opens
  useEffect(() => {
    if (!open) return;
    const modelEnum = media.model as AiModelsEnum;
    setMediaType(media.type as GenerationTypeEnum);
    setModel(modelEnum);
    Object.entries(media.input).forEach(([key, value]) => {
      setField(modelEnum, key, value);
    });
  }, [open]);

  const handleEditGeneration = async () => {
    try {
      const state = states[model];
      if (!state) return;
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      await editMutation.mutateAsync({
        mediaId: media.id,
        model,
        mediaType,
        input: state,
      });
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const modelList =
    mediaType === GenerationTypeEnum.VIDEO
      ? VIDEO_MODELS
      : mediaType === GenerationTypeEnum.AUDIO
      ? AUDIO_MODELS
      : IMAGE_MODELS;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full p-0 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col gap-0">
        <DialogTitle className="sr-only">Edit Generation</DialogTitle>

        {/* Media preview (top) */}
        <div className="relative bg-black flex items-center justify-center max-h-[35vh] overflow-hidden">
          {media.type === "video" ? (
            <video src={media.url} autoPlay loop muted className="max-w-full max-h-[35vh] object-contain" />
          ) : media.type === "audio" ? (
            <div className="p-8 flex flex-col items-center gap-4 w-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
              <audio src={media.url} controls className="w-full max-w-sm" />
            </div>
          ) : (
            <img src={media.url} alt="Media" className="max-w-full max-h-[35vh] object-contain" />
          )}
        </div>

        {/* Editor body */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Model selector */}
         

          {/* Model-specific composer */}
          <div className="px-2 py-2 flex-1">
            {model === AiModelsEnum.GEMINI_FLASH_IMAGE && <GeminiFlashImageComposer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.KLING_O3_IMAGE && <KlingO3ImageComposer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.VEO_3 && <Veo3Composer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.KLING_V3_PRO_MOTION_CONTROL && <KlingV3ProMotionControlComposer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.KLING_V3_IMAGE_TO_VIDEO && <KlingV3ImageToVideoComposer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.KLING_V3_TEXT_TO_VIDEO && <KlingV3TextToVideoComposer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.ELEVEN_LABS_V3_TTS && <ElevenLabsV3Composer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.SEEDREAM_V4_5 && <SeedreamV45Composer isFocused={true} editMode={true} />}
            {model === AiModelsEnum.SEEDANCE_2_0 && <Seedance20Composer isFocused={true} editMode={true} />}
          </div>

          {/* Confirm button */}
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <button
              onClick={handleEditGeneration}
              disabled={editMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
