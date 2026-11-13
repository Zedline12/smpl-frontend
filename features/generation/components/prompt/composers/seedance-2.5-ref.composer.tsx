import { useRef, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Music, Plus, Video, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Menu, MenuItem } from "@/components/menu";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import GenerateAudioSelector from "@/features/generation/components/selectors/GenerateAudioSelector";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import ResolutionSelector from "@/features/generation/components/selectors/ResolutionSelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import type { AllModelsAspectRatio } from "@/features/generation/types/generation";
import { Seedance25RefInputConst } from "@/features/generation/types/models/seedance-2.5-ref-to-video.type";
import {
  Seedance25InputConst,
  Seedance25Limits as Seedance25RefLimits,
} from "@/features/generation/types/models/seedance-2.5.type";
import { refTag } from "@/components/Seedance25RefPanel";
import { uploadReferenceAudio } from "@/features/artist/api/reference-audio";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";

type RefModel = AiModelsEnum.SEEDANCE_2_5 | AiModelsEnum.FAL_SEEDANCE_2_5;
/** What both Seedance versions keep in the store. */
type RefState = {
  prompt?: string;
  images?: string[];
  videos?: string[];
  audios?: string[];
  duration?: number;
  aspectRatio?: string;
  resolution?: string;
  generateAudio?: boolean;
};
type RefKind = "images" | "videos" | "audios";

const TAG: Record<RefKind, string> = { images: "Image", videos: "Video", audios: "Audio" };
const MAX: Record<RefKind, number> = {
  images: Seedance25RefLimits.maxImages,
  videos: Seedance25RefLimits.maxVideos,
  audios: Seedance25RefLimits.maxAudios,
};

// The shared selectors type their options as the union of every model's values.
type Ratio = AllModelsAspectRatio;
type Res = Parameters<typeof ResolutionSelector>[0]["value"];

const pill =
  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center";

/** Length of an audio file in seconds (NaN if the browser can't read it). */
const audioDuration = (file: File) =>
  new Promise<number>((resolve) => {
    const el = document.createElement("audio");
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      resolve(el.duration);
      URL.revokeObjectURL(el.src);
    };
    el.onerror = () => resolve(NaN);
    el.src = URL.createObjectURL(file);
  });

function RefTile({
  kind,
  index,
  url,
  onRemove,
  onTag,
  model,
}: {
  kind: RefKind;
  index: number;
  url: string;
  onRemove: () => void;
  onTag: (tag: string) => void;
  model: RefModel;
}) {
  const tag = refTag(model, TAG[kind], index + 1);
  return (
    <div className="group relative flex h-20 w-20 shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {kind === "images" ? (
        <img src={url} alt={tag} className="h-full w-full object-cover" />
      ) : kind === "videos" ? (
        <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
          <Music className="size-6 text-white/70" />
        </div>
      )}
      <button
        type="button"
        onClick={() => onTag(tag)}
        title={`Insert ${tag} into the prompt`}
        className="absolute inset-x-1 bottom-1 cursor-pointer rounded-md bg-black/70 px-1 py-0.5 text-center font-mono text-[10px] font-semibold text-white backdrop-blur-sm hover:bg-black/90"
      >
        {tag}
      </button>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${tag}`}
        className="absolute top-1 right-1 cursor-pointer rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/80"
      >
        <X className="size-3 text-white" />
      </button>
    </div>
  );
}

function AddTile({
  icon: Icon,
  label,
  onClick,
  busy,
}: {
  icon: typeof ImageIcon;
  label: string;
  onClick: () => void;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="group flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-white/40 hover:bg-white/5 disabled:cursor-wait"
    >
      {busy ? (
        <Loader2 className="size-5 animate-spin text-white/60" />
      ) : (
        <>
          <Icon className="size-5 text-white/50 transition-colors group-hover:text-white" />
          <span className="flex items-center gap-0.5 text-[10px] text-white/50 group-hover:text-white">
            <Plus className="size-2.5" />
            {label}
          </span>
        </>
      )}
    </button>
  );
}

/**
 * Seedance 2.5 from references: up to 9 images, 3 videos and 3 audio clips, mentioned
 * in the prompt by tag ([Image 1] on llmapi, @Image1 on fal).
 */
export default function Seedance25RefComposer({
  isFocused,
  editMode,
  model = AiModelsEnum.SEEDANCE_2_5,
}: {
  isFocused: boolean;
  editMode?: boolean;
  model?: RefModel;
}) {
  // llmapi has fixed sizes (no "auto"/21:9); fal accepts more ratios.
  const consts = model === AiModelsEnum.SEEDANCE_2_5 ? Seedance25InputConst : Seedance25RefInputConst;
  const [picker, setPicker] = useState<"images" | "videos" | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const { states, setField: setModelField } = useAiModelStore();
  const state = (states[model] ?? {}) as RefState;
  const setField = (key: keyof RefState, value: unknown) => setModelField(model, key, value);

  const { prompt, duration = 5, aspectRatio = "16:9", resolution = "720p", generateAudio = true } = state;
  const refs: Record<RefKind, string[]> = {
    images: state.images ?? [],
    videos: state.videos ?? [],
    audios: state.audios ?? [],
  };
  const total = refs.images.length + refs.videos.length + refs.audios.length;

  const remove = (kind: RefKind, index: number) =>
    setField(
      kind,
      refs[kind].filter((_, i) => i !== index),
    );

  // Puts "@Image1" at the cursor (or the end) so users don't have to type it.
  const insertTag = (tag: string) => {
    const text = prompt ?? "";
    const el = promptRef.current;
    const at = el && document.activeElement === el ? el.selectionStart : text.length;
    const before = text.slice(0, at);
    const spacer = before && !/\s$/.test(before) ? " " : "";
    const next = `${before}${spacer}${tag} ${text.slice(at)}`;
    setField("prompt", next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = (before + spacer + tag + " ").length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const onAudioFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX.audios - refs.audios.length;
    const picked = Array.from(files).slice(0, room);
    setUploadingAudio(true);
    const added: string[] = [];
    try {
      for (const file of picked) {
        if (!file.type.startsWith("audio/")) {
          toast.error(`${file.name} isn't an audio file`);
          continue;
        }
        const seconds = await audioDuration(file);
        if (
          Number.isFinite(seconds) &&
          (seconds < Seedance25RefLimits.minReferenceSec || seconds > Seedance25RefLimits.maxReferenceSec + 0.2)
        ) {
          toast.error(
            `${file.name} is ${seconds.toFixed(1)}s. Reference audio must be ${Seedance25RefLimits.minReferenceSec}–${Seedance25RefLimits.maxReferenceSec}s.`,
          );
          continue;
        }
        added.push(await uploadReferenceAudio(file));
      }
      if (added.length) setField("audios", [...refs.audios, ...added]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Audio upload failed");
      if (added.length) setField("audios", [...refs.audios, ...added]);
    } finally {
      setUploadingAudio(false);
      if (audioInput.current) audioInput.current.value = "";
    }
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["images", "videos", "audios"] as RefKind[]).flatMap((kind) =>
            refs[kind].map((url, i) => (
              <RefTile
                key={`${kind}-${url}-${i}`}
                kind={kind}
                index={i}
                url={url}
                onRemove={() => remove(kind, i)}
                onTag={insertTag}
                model={model}
              />
            )),
          )}
          {refs.images.length < MAX.images && (
            <AddTile icon={ImageIcon} label="Image" onClick={() => setPicker("images")} />
          )}
          {refs.videos.length < MAX.videos && <AddTile icon={Video} label="Video" onClick={() => setPicker("videos")} />}
          {refs.audios.length < MAX.audios && (
            <AddTile icon={Music} label="Audio" busy={uploadingAudio} onClick={() => audioInput.current?.click()} />
          )}
        </div>

        <p className="text-xs text-white/45">
          {total === 0
            ? "Optional: add references (image, video or audio) and mention them in your prompt."
            : `Click a tag to mention it in your prompt, e.g. “${refTag(model, "Image", 1)} dances to ${refTag(model, "Audio", 1)}”.`}{" "}
          Up to {MAX.images} images, {MAX.videos} videos and {MAX.audios} audio clips ({Seedance25RefLimits.minReferenceSec}–
          {Seedance25RefLimits.maxReferenceSec}s each).
        </p>

        <Textarea
          ref={promptRef}
          value={prompt || ""}
          onChange={(e) => setField("prompt", e.target.value)}
          maxLength={Seedance25RefLimits.maxPromptLength}
          placeholder={`Describe the video, mentioning references like ${refTag(model, "Image", 1)} or ${refTag(model, "Video", 1)}...`}
          className="placeholder:text-foreground/70 text-foreground min-h-[100px] flex-1 resize-none border-none bg-transparent pt-2 text-lg outline-none focus:ring-0"
        />
      </div>

      <input
        ref={audioInput}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => void onAudioFiles(e.target.files)}
      />

      <MediaManagerDialog
        open={picker === "images"}
        onOpenChange={(open) => !open && setPicker(null)}
        selectedImages={refs.images}
        onSelect={(urls) => setField("images", urls.slice(0, MAX.images))}
        maxSelections={MAX.images}
      />
      <MediaManagerDialog
        open={picker === "videos"}
        onOpenChange={(open) => !open && setPicker(null)}
        mediaType="video"
        selectedImages={refs.videos}
        onSelect={(urls) => setField("videos", urls.slice(0, MAX.videos))}
        maxSelections={MAX.videos}
      />

      <PromptComposerFooter isFocused={isFocused} editMode={editMode}>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-row sm:gap-0">
          <Menu
            direction="up"
            trigger={<div className={pill}>{aspectRatio === "auto" ? "Auto ratio" : aspectRatio}</div>}
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="m-0 w-[200px] p-0 sm:w-100">
              <AspectRatioSelectorComponent
                options={consts.aspectRatio as unknown as readonly Ratio[]}
                value={aspectRatio as unknown as Ratio}
                onChange={(value) => setField("aspectRatio", value)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={<div className={pill}>Duration: {duration}s</div>}
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="m-0 w-[max-content] p-0 sm:w-100">
              <DurationSelector
                options={consts.duration}
                value={duration}
                onChange={(v) => setField("duration", v)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={<div className={pill}>{resolution}</div>}
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="m-0 w-[max-content] p-0 sm:w-100">
              <ResolutionSelector
                options={consts.resolution as unknown as readonly Res[]}
                value={resolution as Res}
                onChange={(v) => setField("resolution", v)}
              />
            </MenuItem>
          </Menu>

          <Menu
            direction="up"
            trigger={<div className={pill}>Audio: {generateAudio ? "Yes" : "No"}</div>}
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="m-0 w-[240px] p-0 sm:w-100">
              <GenerateAudioSelector value={generateAudio} onChange={(v) => setField("generateAudio", v)} />
            </MenuItem>
          </Menu>
        </div>
      </PromptComposerFooter>
    </>
  );
}
