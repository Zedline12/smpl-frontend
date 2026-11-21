"use client";
import { ArtistVideoClipInputConst } from "@/features/generation/types/models/artist-video-clip.type";
import { clipSeconds, useVideoClipBuilder } from "../../hooks/useVideoClipBuilder";
import { AudioWindowPicker } from "../AudioWindowPicker";
import { Segmented, studioLabel } from "./ChipGroup";
import { ClipCharacterPicker, ClipStylePicker } from "./ClipInputs";
import { GenerateButton, StudioCard } from "./StudioCard";

export const CLIP_ASPECTS = [
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
  { id: "1:1", label: "1:1" },
] as const;
export const CLIP_RESOLUTIONS = ArtistVideoClipInputConst.resolution.map((id) => ({ id, label: id }));

/** Make a video clip: character · song part · style, prompt and Generate (desktop). */
export function VideoClipSettings() {
  const clip = useVideoClipBuilder();
  const { state, set, audio } = clip;

  return (
    // Phones get the compact dock (MobileClipDock) instead.
    <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-[1fr_1.35fr_1fr]">
      <StudioCard className="gap-4">
        <span className={studioLabel}>Your character</span>
        <ClipCharacterPicker
          images={state.images}
          onChange={(images) => set("images", images)}
          disabled={clip.pending}
        />
        <p className="text-xs text-white/40">
          A clear photo of the face and outfit works best. Up to {ArtistVideoClipInputConst.maxImages} images.
        </p>
      </StudioCard>

      <StudioCard className="gap-3">
        <div className="flex items-center justify-between">
          <span className={studioLabel}>Song part</span>
          <span className="text-xs text-white/45">
            {audio ? `${clipSeconds(audio.lengthSec)}s clip` : "4–30 seconds"}
          </span>
        </div>
        <AudioWindowPicker value={audio} onChange={clip.changeAudio} disabled={clip.pending} />
      </StudioCard>

      <StudioCard className="gap-4 md:col-span-2 xl:col-span-1">
        <div className="flex flex-col gap-2.5">
          <span className={studioLabel}>Style</span>
          <ClipStylePicker value={state.style} onChange={(style) => set("style", style)} disabled={clip.pending} />
        </div>

        <div className="flex flex-col gap-2.5">
          <span className={studioLabel}>Your prompt · optional</span>
          <textarea
            value={state.prompt}
            onChange={(e) => set("prompt", e.target.value)}
            maxLength={ArtistVideoClipInputConst.maxPromptLength}
            rows={3}
            placeholder="e.g. wearing a red hoodie, golden hour, close-up shots"
            className="focus:border-primary/50 resize-none rounded-2xl border border-white/[0.07] bg-black/30 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Segmented
            label="Format"
            options={[...CLIP_ASPECTS]}
            value={state.aspectRatio as (typeof CLIP_ASPECTS)[number]["id"]}
            onChange={(aspectRatio) => set("aspectRatio", aspectRatio)}
            disabled={clip.pending}
          />
          <Segmented
            label="Quality"
            options={CLIP_RESOLUTIONS}
            value={state.resolution}
            onChange={(resolution) => set("resolution", resolution)}
            disabled={clip.pending}
          />
        </div>

        <GenerateButton
          className="mt-auto"
          label={clip.label}
          credits={clip.creditsCost}
          onClick={() => void clip.generate()}
          disabled={!clip.canGenerate}
          hint={clip.missing}
          needsProject={!!clip.user && !clip.templateMode}
        />
      </StudioCard>
    </div>
  );
}
