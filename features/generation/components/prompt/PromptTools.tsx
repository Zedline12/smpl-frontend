"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { isFreePlan as isUserOnFreePlan } from "@/lib/subscription";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import SpeechToText from "./SpeechToText";

/** Voice input + AI prompt enhancer, shown in the bottom-right corner of the prompt box. */
export function PromptTools({ className }: { className?: string }) {
  const { model, mediaType } = useAiGenerationControlStore();
  const { states, setField } = useAiModelStore();
  const prompt = (states[model] as { prompt?: string } | undefined)?.prompt ?? "";
  const { user } = useAuth();
  const isFreePlan = isUserOnFreePlan(user);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhance = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/generation/prompt-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mediaType }),
      });
      const json = await res.json();
      if (json.data?.prompt) setField(model, "prompt", json.data.prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const hint = isFreePlan
    ? "Enhance prompt (unlocked for paid users)"
    : isEnhancing
      ? "Enhancing…"
      : "Enhance prompt";

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <SpeechToText />
      <div className="group relative">
        <button
          type="button"
          onClick={enhance}
          disabled={isFreePlan || prompt.length < 10 || isEnhancing}
          aria-label={hint}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 transition-all duration-200 hover:enabled:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image
            src="/robot.png"
            alt=""
            width={16}
            height={16}
            className={`h-4 w-4 ${isEnhancing ? "animate-robot-glow" : "opacity-50 transition-opacity group-hover:opacity-100"}`}
          />
        </button>
        <div className="pointer-events-none absolute right-0 bottom-full mb-2 rounded-md border border-white/10 bg-black/80 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white/80 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {hint}
        </div>
      </div>
    </div>
  );
}
