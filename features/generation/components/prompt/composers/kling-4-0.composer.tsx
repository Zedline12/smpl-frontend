import { useRef, useState } from "react";
import { Image as ImageIcon, Plus, Video, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Menu, MenuItem } from "@/components/menu";
import { cn } from "@/lib/utils";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import DurationSelector from "@/features/generation/components/selectors/DurationSelector";
import AspectRatioSelectorComponent from "@/features/generation/components/selectors/AspectRatioSelector";
import ResolutionSelector from "@/features/generation/components/selectors/ResolutionSelector";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import type { AllModelsAspectRatio } from "@/features/generation/types/generation";
import {
  Kling40FlashInputConst,
  Kling40InputConst,
  KlingOmniLimits,
  type IKling40Input,
} from "@/features/generation/types/models/kling-4-0.type";
import { MediaManagerDialog } from "../MediaManagerDialog";
import PromptComposerFooter from "../PromptComposerFooter";

type KlingModel = AiModelsEnum.KLING_4_0 | AiModelsEnum.KLING_4_0_FLASH;
type RefKind = "images" | "videos";
const TAG: Record<RefKind, string> = { images: "Image", videos: "Video" };
const MAX: Record<RefKind, number> = { images: KlingOmniLimits.maxImages, videos: KlingOmniLimits.maxVideos };

type Ratio = AllModelsAspectRatio;
type Res = Parameters<typeof ResolutionSelector>[0]["value"];

const pill =
  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-white/10 border border-white/20 w-full text-center";


function RefTile({ kind, index, url, onRemove, onTag }: { kind: RefKind; index: number; url: string; onRemove: () => void; onTag: (tag: string) => void }) {
  const tag = `@${TAG[kind]}${index + 1}`;
  return (
    <div className="group relative flex h-20 w-20 shrink-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5">
      {kind === "images" ? (
        <img src={url} alt={tag} className="h-full w-full object-cover" />
      ) : (
        <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
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

function AddTile({ icon: Icon, label, onClick }: { icon: typeof ImageIcon; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/10 transition-all hover:border-white/40 hover:bg-white/5"
    >
      <Icon className="size-5 text-white/50 transition-colors group-hover:text-white" />
      <span className="flex items-center gap-0.5 text-[10px] text-white/50 group-hover:text-white">
        <Plus className="size-2.5" />
        {label}
      </span>
    </button>
  );
}

/**
 * Kling 4.0 and 4.0 Flash: a prompt plus optional reference images (@Image1…) and videos
 * (@Video1…, for motion and camera), with ratio, duration, resolution and sound.
 */
export default function Kling40Composer({
  isFocused,
  editMode,
  model = AiModelsEnum.KLING_4_0,
}: {
  isFocused: boolean;
  editMode?: boolean;
  model?: KlingModel;
}) {
  const consts = model === AiModelsEnum.KLING_4_0 ? Kling40InputConst : Kling40FlashInputConst;
  const [picker, setPicker] = useState<RefKind | null>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  const { states, setField: setModelField } = useAiModelStore();
  const state = (states[model] ?? {}) as Partial<IKling40Input>;
  const setField = (key: keyof IKling40Input, value: unknown) => setModelField(model, key, value);

  const prompt = state.prompt ?? "";
  const duration = state.duration ?? 5;
  const aspectRatio = (consts.aspectRatio as readonly string[]).includes(state.aspectRatio ?? "") ? (state.aspectRatio as string) : "16:9";
  const resolution = (consts.resolution as readonly string[]).includes(state.resolution ?? "")
    ? (state.resolution as string)
    : consts.resolution[consts.resolution.length - 1];
  const audio = state.audio ?? "native";
  const refs: Record<RefKind, string[]> = { images: state.images ?? [], videos: state.videos ?? [] };
  const total = refs.images.length + refs.videos.length;

  const remove = (kind: RefKind, index: number) => {
    const next = refs[kind].filter((_, i) => i !== index);
    setField(kind, next);
    // Keeping the original sound needs a video.
    if (kind === "videos" && !next.length && audio === "original") setField("audio", "native");
  };

  const insertTag = (tag: string) => {
    const el = promptRef.current;
    const at = el && document.activeElement === el ? el.selectionStart : prompt.length;
    const before = prompt.slice(0, at);
    const spacer = before && !/\s$/.test(before) ? " " : "";
    setField("prompt", `${before}${spacer}${tag} ${prompt.slice(at)}`);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = (before + spacer + tag + " ").length;
      el?.setSelectionRange(pos, pos);
    });
  };

  return (
    <>
      <div style={{ zIndex: 1 }} className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["images", "videos"] as RefKind[]).flatMap((kind) =>
            refs[kind].map((url, i) => (
              <RefTile key={`${kind}-${url}-${i}`} kind={kind} index={i} url={url} onRemove={() => remove(kind, i)} onTag={insertTag} />
            )),
          )}
          {refs.images.length < MAX.images && <AddTile icon={ImageIcon} label="Image" onClick={() => setPicker("images")} />}
          {refs.videos.length < MAX.videos && <AddTile icon={Video} label="Video" onClick={() => setPicker("videos")} />}
        </div>

        <p className="text-xs text-white/45">
          {total === 0
            ? "Optional: add reference images or videos and mention them in your prompt."
            : "Click a tag to mention it in your prompt, e.g. “@Image1 runs through the city like @Video1”."}{" "}
          Up to {MAX.images} images and {MAX.videos} videos ({KlingOmniLimits.minReferenceSec}–
          {consts.duration[consts.duration.length - 1]}s).
        </p>

        <Textarea
          ref={promptRef}
          value={prompt}
          onChange={(e) => setField("prompt", e.target.value)}
          maxLength={KlingOmniLimits.maxPromptLength}
          placeholder="Describe the video, mentioning references like @Image1 or @Video1..."
          className="placeholder:text-foreground/70 text-foreground min-h-[100px] flex-1 resize-none border-none bg-transparent pt-2 text-lg outline-none focus:ring-0"
        />
      </div>

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
            trigger={<div className={pill}>{aspectRatio}</div>}
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
              <DurationSelector options={consts.duration} value={duration} onChange={(v) => setField("duration", v)} />
            </MenuItem>
          </Menu>

          {consts.resolution.length > 1 ? (
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
          ) : (
            <div className={cn(pill, "cursor-default hover:bg-white/10")} title="Kling 4.0 Flash renders at 720p">
              {resolution}
            </div>
          )}

          <Menu
            direction="up"
            trigger={<div className={pill}>Sound: {audio === "original" ? "Original" : "Generated"}</div>}
            align="left"
            menuClassName="max-sm:!left-1 max-sm:!-translate-x-1/2"
          >
            <MenuItem className="m-0 w-[260px] p-0 sm:w-100">
              <div className="bg-background-light flex w-full flex-col gap-1 rounded-lg p-3">
                <p className="text-muted-foreground font-medium">Sound</p>
                {(
                  [
                    { value: "native", label: "Generated", hint: "Kling creates sound that fits the video" },
                    { value: "original", label: "Original", hint: "Keep the sound of @Video1" },
                  ] as const
                ).map((o) => {
                  const disabled = o.value === "original" && !refs.videos.length;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setField("audio", o.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        audio === o.value ? "border-white/40 bg-white/10" : "border-white/10 hover:bg-white/5",
                      )}
                    >
                      <span className="block text-sm font-medium text-white">{o.label}</span>
                      <span className="block text-xs text-white/50">{disabled ? "Add a reference video first" : o.hint}</span>
                    </button>
                  );
                })}
              </div>
            </MenuItem>
          </Menu>
        </div>
      </PromptComposerFooter>
    </>
  );
}
