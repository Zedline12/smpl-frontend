"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  MusicCompositionPlan,
  MusicLimits,
} from "@/features/generation/types/models/elevenlabs-music-v2-5.type";
import { useMusicPlanMutation } from "../hooks/useMusicPlan";

const LENGTH_OPTIONS = [30, 60, 90, 120, 180, 240, 300, 420, 600];

interface WriteForMePanelProps {
  /** Asked before replacing a song the user has already edited. */
  hasWork: boolean;
  onPlan: (plan: MusicCompositionPlan) => void;
}

export function WriteForMePanel({ hasWork, onPlan }: WriteForMePanelProps) {
  const [idea, setIdea] = useState("");
  const [lengthSec, setLengthSec] = useState(120);
  const createPlan = useMusicPlanMutation();

  const write = () => {
    if (hasWork && !window.confirm("Replace your current song structure with a new draft?")) return;
    createPlan.mutate(
      { idea: idea.trim(), lengthMs: lengthSec * 1000 },
      { onSuccess: onPlan },
    );
  };

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-primary/25 bg-primary/[0.06] p-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Sparkles className="text-primary size-4" />
        Write it for me
      </div>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        maxLength={MusicLimits.maxIdeaLength}
        rows={2}
        placeholder="A cozy lo-fi rap about late-night drives in the rain"
        className="resize-none rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/25 focus:outline-none"
      />
      <div className="flex items-center gap-2">
        <select
          value={lengthSec}
          onChange={(e) => setLengthSec(Number(e.target.value))}
          aria-label="Song length"
          className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white [color-scheme:dark] focus:outline-none"
        >
          {LENGTH_OPTIONS.map((sec) => (
            <option key={sec} value={sec}>
              {sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")} min`}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={write}
          disabled={!idea.trim() || createPlan.isPending}
          className="bg-primary ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {createPlan.isPending ? "Writing…" : "Write song"}
        </button>
      </div>
      <p className="text-[11px] text-white/40">Fills in sections and lyrics — you can edit everything after.</p>
    </div>
  );
}
