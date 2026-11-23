"use client";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ArtistVideoClipInputConst } from "@/features/generation/types/models/artist-video-clip.type";
import { cn } from "@/lib/utils";
import { useClipScenes } from "../../api/clip-scenes";
import { clipSeconds, useVideoClipBuilder } from "../../hooks/useVideoClipBuilder";
import { AudioWindowPicker } from "../AudioWindowPicker";
import { Segmented, studioLabel } from "./ChipGroup";
import {
  CLIP_SCENE_OPTIONS,
  CLIP_TYPE_OPTIONS,
  ClipCharacterPicker,
  ClipMoodPicker,
  ORIGINAL_PHOTO_HINT,
} from "./ClipInputs";
import { GenerateButton } from "./StudioCard";
import { PlaceChooser } from "./PlaceChooser";
import { LyricsStylePanel } from "./LyricsStylePanel";

type Clip = ReturnType<typeof useVideoClipBuilder>;

/** The optional prompt, with the mood knob below it. */
function MoodAndPrompt({ clip }: { clip: Clip }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <span className="pointer-events-none absolute top-2.5 right-3 rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
          Optional
        </span>
        <textarea
          value={clip.state.prompt}
          onChange={(e) => clip.set("prompt", e.target.value)}
          maxLength={ArtistVideoClipInputConst.maxPromptLength}
          rows={4}
          aria-label="Your prompt (optional)"
          placeholder={
            clip.type === "lyrics" ? "e.g. neon signs, empty road, warm lights" : "e.g. wearing a red hoodie, close-up shots"
          }
          className="focus:border-primary/50 w-full resize-none rounded-2xl border border-white/[0.07] bg-black/30 py-3 pr-24 pl-4 text-sm leading-relaxed text-white placeholder:text-white/30 focus:outline-none"
        />
      </div>
      <div className="flex flex-col items-start gap-2.5">
        <span className={studioLabel}>Mood</span>
        <ClipMoodPicker compact hideLabel value={clip.picks.mood} onChange={(mood) => clip.set("mood", mood)} disabled={clip.pending} />
      </div>
    </div>
  );
}

type StepId = "song" | "place" | "character" | "finish";

const STEP_TITLES: Record<StepId, string> = {
  song: "Choose your song",
  place: "The place",
  character: "Your character",
  finish: "Settings",
};

const GRADIENT = { background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" };

/** The steps bar: earlier steps can be clicked to go back. */
function Stepper({ steps, current, onGo }: { steps: StepId[]; current: number; onGo: (i: number) => void }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((id, i) => {
        const done = i < current;
        const on = i === current;
        return (
          <li key={id} className={cn("flex min-w-0 items-center gap-2", i < steps.length - 1 && "flex-1")}>
            <button
              type="button"
              onClick={() => onGo(i)}
              disabled={i > current}
              aria-current={on ? "step" : undefined}
              className="flex min-w-0 items-center gap-2.5 rounded-full text-left disabled:cursor-default"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors",
                  on
                    ? "border-transparent text-white shadow-[0_0_18px_-6px_var(--color-primary)]"
                    : done
                      ? "border-primary/60 text-primary hover:bg-primary/10"
                      : "border-white/15 text-white/35",
                )}
                style={on ? GRADIENT : undefined}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-sm font-semibold lg:block",
                  on ? "text-white" : done ? "text-white/70" : "text-white/35",
                )}
              >
                {STEP_TITLES[id]}
              </span>
            </button>
            {i < steps.length - 1 && <span className={cn("h-px min-w-4 flex-1", done ? "bg-primary/50" : "bg-white/10")} />}
          </li>
        );
      })}
    </ol>
  );
}

function StepHeading({ title, hint, center }: { title: string; hint?: string; center?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1", center && "items-center text-center")}>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {hint && <p className="text-xs text-white/45">{hint}</p>}
    </div>
  );
}

const navBtn =
  "flex h-11 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Make a video clip (desktop), in steps: the song, the place, the character (lip sync),
 * then mood, prompt and lyrics with Generate. Back goes to any earlier step; optional
 * steps have Skip.
 */
export function VideoClipSettings() {
  const clip = useVideoClipBuilder();
  const { state, set, audio } = clip;
  const lipsync = clip.type === "lipsync";
  const generated = !lipsync || clip.scene === "song";
  const scenes = useClipScenes();
  /** Lyrics on a ready-made video: no picks, prompt or mood go to Kling. */
  const premade = !!clip.backgroundVideoId;

  const steps: StepId[] = lipsync ? ["song", "place", "character", "finish"] : ["song", "place", "finish"];
  const [index, setIndex] = useState(0);
  const at = Math.min(index, steps.length - 1);
  const step = steps[at];
  const go = (i: number) => setIndex(Math.max(0, Math.min(i, steps.length - 1)));

  // Next needs the step's required input; the place step is all optional (it has picks already).
  const canNext = step === "song" ? !!audio : step === "character" ? state.images.length > 0 : true;
  const optional = step === "place";

  const placeHint = !generated
    ? ORIGINAL_PHOTO_HINT
    : "Choose how to set the place: tap a card. Skip keeps the one in use.";

  return (
    // Phones get the compact dock (MobileClipDock) instead.
    <div className="hidden flex-col gap-6 md:flex">
      <Stepper steps={steps} current={at} onGo={go} />

      <div className="min-h-[22rem]">
        {step === "song" && (
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4">
            <div className="w-72"><Segmented label="" options={CLIP_TYPE_OPTIONS} value={clip.type} onChange={(type) => {
              set("type", type);
              // Each type's usual place for the lines: over the scene, or under the singer.
              set("lyricsPosition", type === "lipsync" ? "bottom" : "center");
              set("backgroundDim", null);
            }} disabled={clip.pending} /></div>
            <StepHeading
              center
              title="Choose your song"
              hint={
                audio
                  ? `${clipSeconds(audio.lengthSec, clip.maxClipSeconds)}s clip`
                  : `Choose a song and the part to use · 4–${clip.maxClipSeconds} seconds`
              }
            />
            <div className="w-full">
              <AudioWindowPicker value={audio} onChange={clip.changeAudio} disabled={clip.pending} maxSeconds={clip.maxClipSeconds} />
            </div>
          </div>
        )}

        {step === "place" && (
          <div className="flex flex-col gap-5">
            <StepHeading title="Where the video is captured" hint={placeHint} />
            {lipsync && (
              <div className="w-full max-w-sm">
                <Segmented label="Scene" options={CLIP_SCENE_OPTIONS} value={clip.scene} onChange={(scene) => set("scene", scene)} disabled={clip.pending} />
              </div>
            )}
            {clip.usesScene && <PlaceChooser clip={clip} scenes={scenes} />}
          </div>
        )}

        {step === "character" && (
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 pt-2">
            <StepHeading center title="Choose your character" hint="A clear, front-facing photo of the face and outfit works best." />
            <div className="w-full">
              <ClipCharacterPicker images={state.images} onChange={(images) => set("images", images)} disabled={clip.pending} />
            </div>
          </div>
        )}

        {step === "finish" && (
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
            {generated && !premade && (
              <div className="flex flex-col gap-4">
                <StepHeading title="Mood & prompt" />
                <MoodAndPrompt clip={clip} />
              </div>
            )}
            <LyricsStylePanel clip={clip} />
          </div>
        )}
      </div>

      <div className="flex items-end gap-3 border-t border-white/[0.06] pt-5">
        {at > 0 && (
          <button
            type="button"
            onClick={() => go(at - 1)}
            className={cn(navBtn, "border border-white/10 text-white/75 hover:bg-white/[0.06] hover:text-white")}
          >
            <ChevronLeft className="size-4" /> Back
          </button>
        )}
        <div className="ml-auto flex items-end gap-3">
          {step === "finish" ? (
            <GenerateButton
              className="w-80"
              label={clip.label}
              credits={clip.creditsCost}
              onClick={() => void clip.generate()}
              disabled={!clip.canGenerate}
              hint={clip.missing}
              needsProject={!!clip.user && !clip.templateMode}
            />
          ) : (
            <>
              {optional && (
                <button type="button" onClick={() => go(at + 1)} className={cn(navBtn, "text-white/55 hover:text-white")}>
                  Skip
                </button>
              )}
              <button
                type="button"
                onClick={() => go(at + 1)}
                disabled={!canNext}
                className={cn(navBtn, "bg-primary hover:bg-primary/90 text-white")}
              >
                Next <ChevronRight className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
