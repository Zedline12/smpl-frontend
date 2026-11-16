"use client";

import { useState } from "react";
import { Image as ImageIcon, Plus, Upload, Video as VideoIcon, X } from "lucide-react";
import { useAiModelStore } from "@/stores/useAiGenerationControlStore";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { KlingOmniLimits } from "@/features/generation/types/models/kling-4-0.type";
import { MediaThumb } from "@/components/MediaThumb";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";

type KlingModel = AiModelsEnum.KLING_4_0 | AiModelsEnum.KLING_4_0_FLASH;
type KlingState = { prompt?: string; images?: string[]; videos?: string[]; audio?: string };
type Kind = "images" | "videos";

const KINDS: { kind: Kind; title: string; tag: string; max: number; icon: typeof ImageIcon; hint: string }[] = [
  { kind: "images", title: "Reference images", tag: "Image", max: KlingOmniLimits.maxImages, icon: ImageIcon, hint: "Characters, products, places, styles" },
  { kind: "videos", title: "Reference videos", tag: "Video", max: KlingOmniLimits.maxVideos, icon: VideoIcon, hint: "Motion, camera moves, pacing" },
];

const slotCard =
  "group relative w-full overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.035] transition-colors hover:border-white/25 hover:bg-white/[0.05]";

/**
 * Kling 4.0 / 4.0 Flash references on /create/video: images (@Image1…) and videos
 * (@Video1…), mentioned in the prompt by tag; click a tag to add it.
 */
export function Kling40RefPanel({ model }: { model: KlingModel }) {
  const { states, setField: raw } = useAiModelStore();
  const s = states[model] as KlingState | undefined;
  const set = (k: keyof KlingState, v: unknown) => raw(model, k, v);
  const [dlg, setDlg] = useState<Kind | null>(null);

  if (!s) return null;
  const refs: Record<Kind, string[]> = { images: s.images ?? [], videos: s.videos ?? [] };
  const total = refs.images.length + refs.videos.length;
  const maxSeconds = model === AiModelsEnum.KLING_4_0 ? 30 : 20;

  const remove = (kind: Kind, index: number) => {
    const next = refs[kind].filter((_, i) => i !== index);
    set(kind, next);
    // "Original" sound comes from @Video1.
    if (kind === "videos" && !next.length && s.audio === "original") set("audio", "native");
  };
  const addTag = (tag: string) => {
    const prompt = s.prompt ?? "";
    if (prompt.includes(tag)) return;
    set("prompt", `${prompt}${prompt && !/\s$/.test(prompt) ? " " : ""}${tag} `);
  };
  const example = "@Image1 races through the city like the camera in @Video1";

  return (
    <>
      {KINDS.map(({ kind, title, tag, max, icon: Icon, hint }) => {
        const items = refs[kind];
        if (!items.length) {
          return (
            <button key={kind} type="button" onClick={() => setDlg(kind)} className={`${slotCard} flex flex-col items-center px-4 pt-6 pb-4 text-center`}>
              <span className="absolute top-2.5 right-2.5 z-[2] rounded-md bg-white/[0.07] px-2 py-0.5 text-[10px] font-medium text-white/50 backdrop-blur-sm">
                Optional
              </span>
              <span className="flex -space-x-2">
                {[Icon, Upload].map((I, i) => (
                  <span
                    key={i}
                    className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-[#1b1c20] text-white/85 shadow-[0_2px_10px_rgba(0,0,0,.35)] transition-transform group-hover:scale-105"
                  >
                    <I className="size-4" />
                  </span>
                ))}
              </span>
              <span className="mt-3 text-[14px] font-bold text-white">{title}</span>
              <span className="mt-1 text-[12px] leading-snug text-white/45">
                {hint}. Up to {max}
                {kind === "videos" ? `, ${KlingOmniLimits.minReferenceSec}–${maxSeconds}s` : ""}.
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
            <div className="grid grid-cols-4 gap-2">
              {items.map((url, i) => {
                const label = `@${tag}${i + 1}`;
                return (
                  <div key={url + i} className="group/ref relative aspect-square w-full overflow-hidden rounded-xl border border-white/10">
                    <MediaThumb url={url} type={kind === "videos" ? "video" : "image"} />
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
                  onClick={() => setDlg(kind)}
                  aria-label={`Add ${tag.toLowerCase()}`}
                  className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 text-white/50 transition-colors hover:border-white/40 hover:text-white"
                >
                  <Plus className="size-5" />
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

      <MediaManagerDialog
        open={dlg === "images"}
        onOpenChange={(o) => !o && setDlg(null)}
        selectedImages={refs.images}
        onSelect={(urls) => {
          set("images", urls.slice(0, KlingOmniLimits.maxImages));
          setDlg(null);
        }}
        maxSelections={KlingOmniLimits.maxImages}
      />
      <MediaManagerDialog
        open={dlg === "videos"}
        onOpenChange={(o) => !o && setDlg(null)}
        mediaType="video"
        selectedImages={refs.videos}
        onSelect={(urls) => {
          set("videos", urls.slice(0, KlingOmniLimits.maxVideos));
          setDlg(null);
        }}
        maxSelections={KlingOmniLimits.maxVideos}
      />
    </>
  );
}
