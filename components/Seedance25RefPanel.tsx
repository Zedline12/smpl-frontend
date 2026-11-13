"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, Music, Plus, Upload, Video as VideoIcon, X } from "lucide-react";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { Seedance25Limits as Seedance25RefLimits } from "@/features/generation/types/models/seedance-2.5.type";
import { uploadReferenceAudio } from "@/features/artist/api/reference-audio";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";

type RefModel = AiModelsEnum.SEEDANCE_2_5 | AiModelsEnum.FAL_SEEDANCE_2_5;
/** What both Seedance versions keep in the store. */
type RefState = { prompt?: string; images?: string[]; videos?: string[]; audios?: string[] };

/** How each provider wants references named in the prompt. */
export const refTag = (model: RefModel, tag: string, n: number) =>
  model === AiModelsEnum.SEEDANCE_2_5 ? `[${tag} ${n}]` : `@${tag}${n}`;

type Kind = "images" | "videos" | "audios";

const KINDS: { kind: Kind; title: string; tag: string; max: number; icon: typeof ImageIcon; hint: string }[] = [
  { kind: "images", title: "Reference images", tag: "Image", max: Seedance25RefLimits.maxImages, icon: ImageIcon, hint: "Characters, products, places, styles" },
  { kind: "videos", title: "Reference videos", tag: "Video", max: Seedance25RefLimits.maxVideos, icon: VideoIcon, hint: "Motion, camera moves, choreography" },
  { kind: "audios", title: "Reference audio", tag: "Audio", max: Seedance25RefLimits.maxAudios, icon: Music, hint: "A song, a voice, sound effects" },
];

const slotCard =
  "group relative w-full overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.035] transition-colors hover:border-white/25 hover:bg-white/[0.05]";

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

function Thumb({ kind, url }: { kind: Kind; url: string }) {
  if (kind === "images") return <img src={url} alt="" className="h-full w-full object-cover" />;
  if (kind === "videos")
    return <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />;
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
      <Music className="size-5 text-white/70" />
    </div>
  );
}

/**
 * Seedance 2.5 references on /create/video: images, videos and audio, each mentioned in
 * the prompt by tag ([Image 1] on llmapi, @Image1 on fal); click a tag to add it.
 */
export function Seedance25RefPanel({ model = AiModelsEnum.SEEDANCE_2_5 }: { model?: RefModel }) {
  const { states, setField: raw } = useAiModelStore();
  const s = states[model] as RefState | undefined;
  const set = (k: keyof RefState, v: unknown) => raw(model, k, v);
  const [dlg, setDlg] = useState<"images" | "videos" | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioInput = useRef<HTMLInputElement>(null);

  const refs: Record<Kind, string[]> = { images: s?.images ?? [], videos: s?.videos ?? [], audios: s?.audios ?? [] };
  const total = refs.images.length + refs.videos.length + refs.audios.length;

  const remove = (kind: Kind, index: number) => set(kind, refs[kind].filter((_, i) => i !== index));

  const addTag = (tag: string) => {
    const prompt = s?.prompt ?? "";
    if (prompt.includes(tag)) return;
    set("prompt", `${prompt}${prompt && !/\s$/.test(prompt) ? " " : ""}${tag} `);
  };

  const open = (kind: Kind) => (kind === "audios" ? audioInput.current?.click() : setDlg(kind));

  const onAudioFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = Array.from(files).slice(0, Seedance25RefLimits.maxAudios - refs.audios.length);
    const added: string[] = [];
    setUploading(true);
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      if (added.length) set("audios", [...refs.audios, ...added]);
      setUploading(false);
      if (audioInput.current) audioInput.current.value = "";
    }
  };

  if (!s) return null;
  const example = `${refTag(model, "Image", 1)} dances to ${refTag(model, "Audio", 1)} like in ${refTag(model, "Video", 1)}`;

  return (
    <>
      {KINDS.map(({ kind, title, tag, max, icon: Icon, hint }) => {
        const items = refs[kind];
        const busy = kind === "audios" && uploading;
        if (!items.length) {
          return (
            <button
              key={kind}
              type="button"
              onClick={() => open(kind)}
              disabled={busy}
              className={`${slotCard} flex flex-col items-center px-4 pt-6 pb-4 text-center`}
            >
              <span className="absolute top-2.5 right-2.5 z-[2] rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-white/50 backdrop-blur-sm">
                Optional
              </span>
              <span className="flex -space-x-2">
                {[busy ? Loader2 : Icon, Upload].map((I, i) => (
                  <span
                    key={i}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#1b1c20] text-white/85 shadow-[0_2px_10px_rgba(0,0,0,.35)] transition-transform group-hover:scale-105"
                  >
                    <I className={`size-4 ${busy && i === 0 ? "animate-spin" : ""}`} />
                  </span>
                ))}
              </span>
              <span className="mt-3 text-[14px] font-bold text-white">{title}</span>
              <span className="mt-1 text-[12px] leading-snug text-white/45">
                {hint}. Up to {max}
                {kind !== "images" ? `, ${Seedance25RefLimits.minReferenceSec}–${Seedance25RefLimits.maxReferenceSec}s each` : ""}.
              </span>
            </button>
          );
        }
        return (
          <div key={kind} className={`${slotCard} border-solid p-3`}>
            <p className="mb-2.5 text-[13px] font-bold text-white">
              {title}{" "}
              <span className="font-normal text-white/40">
                {items.length}/{max}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((url, i) => {
                const label = refTag(model, tag, i + 1);
                return (
                  <div
                    key={url + i}
                    className="group/ref relative size-[64px] shrink-0 overflow-hidden rounded-xl border border-white/10"
                  >
                    <Thumb kind={kind} url={url} />
                    <button
                      type="button"
                      onClick={() => addTag(label)}
                      title={`Add ${label} to the prompt`}
                      className="absolute inset-x-1 bottom-1 cursor-pointer rounded-md bg-black/70 py-0.5 text-center font-mono text-[10px] font-semibold text-white backdrop-blur-sm hover:bg-black/90"
                    >
                      {label}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(kind, i)}
                      aria-label={`Remove ${label}`}
                      className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover/ref:opacity-100"
                    >
                      <X className="size-2.5" />
                    </button>
                  </div>
                );
              })}
              {items.length < max && (
                <button
                  type="button"
                  onClick={() => open(kind)}
                  disabled={busy}
                  aria-label={`Add ${tag.toLowerCase()}`}
                  className="flex size-[64px] shrink-0 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                >
                  {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <p className="px-0.5 text-[11px] leading-snug text-muted-foreground">
        {total === 0
          ? `Optional: add references, then mention them in your prompt, e.g. “${example}”.`
          : `Click a tag to add it to your prompt, e.g. “${example}”.`}
      </p>

      <input
        ref={audioInput}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => void onAudioFiles(e.target.files)}
      />
      <MediaManagerDialog
        open={dlg === "images"}
        onOpenChange={(o) => !o && setDlg(null)}
        selectedImages={refs.images}
        onSelect={(urls) => {
          set("images", urls.slice(0, Seedance25RefLimits.maxImages));
          setDlg(null);
        }}
        maxSelections={Seedance25RefLimits.maxImages}
      />
      <MediaManagerDialog
        open={dlg === "videos"}
        onOpenChange={(o) => !o && setDlg(null)}
        mediaType="video"
        selectedImages={refs.videos}
        onSelect={(urls) => {
          set("videos", urls.slice(0, Seedance25RefLimits.maxVideos));
          setDlg(null);
        }}
        maxSelections={Seedance25RefLimits.maxVideos}
      />
    </>
  );
}
