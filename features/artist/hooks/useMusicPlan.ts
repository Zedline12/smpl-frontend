import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { MusicCompositionPlan } from "@/features/generation/types/models/elevenlabs-music-v2-5.type";

async function createMusicPlan(body: { idea: string; lengthMs: number }) {
  const res = await fetch("/api/generation/music/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Could not write the song");
  return json as MusicCompositionPlan;
}

/** Drafts sections + lyrics from a one-line idea via ElevenLabs' plan generator. */
export function useMusicPlanMutation() {
  return useMutation({
    mutationFn: createMusicPlan,
    onError: (error) => toast.error(error.message),
  });
}
