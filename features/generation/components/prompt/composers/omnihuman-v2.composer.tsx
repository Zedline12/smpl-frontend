import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Music, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { IOmniHumanV2Input, OmniHumanV2InputConst } from "@/features/generation/types/models/omnihuman-v2.type";
import {
  OMNIHUMAN_AUDIO_ACCEPT,
  formatAudioSeconds,
  useOmniHumanAudioUpload,
} from "@/features/generation/hooks/useOmniHumanAudio";
import { PromptTools } from "../PromptTools";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";

const MODEL = AiModelsEnum.OMNIHUMAN_V2;
const { minSeconds, maxSeconds, maxAudioBytes, maxPromptLength } = OmniHumanV2InputConst;

const tile = "group relative h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/5";
const addTile =
  "group flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-primary/50 hover:bg-white/5 disabled:cursor-wait";
const removeButton =
  "absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80";

/** OmniHuman v2: one image of a person + an audio they sing or speak, and an optional scene prompt. */
export default function OmniHumanV2Composer({ isFocused, editMode }: { isFocused: boolean; editMode?: boolean }) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);

  const { states, setField: setModelField } = useAiModelStore();
  const state = (states[MODEL] ?? {}) as Partial<IOmniHumanV2Input>;
  const setField = (key: keyof IOmniHumanV2Input, value: unknown) => setModelField(MODEL, key, value);
  const { prompt, imageUrl, audioUrl, duration } = state;
  const audio = useOmniHumanAudioUpload(setField);

  return (
    <>
      <div style={{ zIndex: 1 }} className="flex flex-col items-start gap-4 sm:flex-row">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-primary-foreground text-xs">Person</span>
            {imageUrl ? (
              <div className={tile}>
                <img loading="lazy" decoding="async" src={imageUrl} alt="Person" className="h-full w-full object-cover" />
                <button type="button" aria-label="Remove image" onClick={() => setField("imageUrl", "")} className={removeButton}>
                  <X className="size-3 text-white" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setImagePickerOpen(true)} className={addTile}>
                <ImageIcon className="text-muted group-hover:text-primary mb-1 size-5 transition-colors" />
                <Plus className="text-muted group-hover:text-primary size-3 transition-colors" />
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-primary-foreground text-xs">Audio</span>
            {audioUrl ? (
              <div className={tile}>
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-white/10 to-transparent">
                  <Music className="size-6 text-white/70" />
                  {duration ? <span className="text-[10px] text-white/60">{formatAudioSeconds(duration)}</span> : null}
                </div>
                <button type="button" aria-label="Remove audio" onClick={audio.clear} className={removeButton}>
                  <X className="size-3 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={audio.uploading}
                onClick={() => audioInput.current?.click()}
                className={addTile}
              >
                {audio.uploading ? (
                  <Loader2 className="size-5 animate-spin text-white/60" />
                ) : (
                  <>
                    <Music className="text-muted group-hover:text-primary mb-1 size-5 transition-colors" />
                    <Plus className="text-muted group-hover:text-primary size-3 transition-colors" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 self-stretch">
          <Textarea
            value={prompt || ""}
            onChange={(e) => setField("prompt", e.target.value)}
            maxLength={maxPromptLength}
            placeholder="Optional: describe the scene, movement and camera..."
            className="placeholder:text-foreground/70 text-foreground min-h-[100px] w-full resize-none border-none bg-transparent pt-2 pb-12 text-lg outline-none focus:ring-0"
          />
          <PromptTools className="absolute right-1 bottom-1" />
        </div>
      </div>

      <p className="mt-2 px-1 text-xs text-white/45">
        A clear photo of one person, and a wav or mp3 of {minSeconds}s to {maxSeconds / 60} min (up to{" "}
        {maxAudioBytes / 1024 / 1024} MB). The video is as long as the audio and has the photo&apos;s shape.
      </p>

      <input
        ref={audioInput}
        type="file"
        accept={OMNIHUMAN_AUDIO_ACCEPT}
        className="hidden"
        onChange={(e) => {
          void audio.upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      <MediaManagerDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        selectedImage={imageUrl}
        onSelect={(images) => setField("imageUrl", images[0])}
        maxSelections={1}
      />

      {/* No settings: the length comes from the audio and the shape from the photo. */}
      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
        <></>
      </PromptComposerFooter>
    </>
  );
}
