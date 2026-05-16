"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProjectSelector from "./selectors/ProjectSelector";
import { useAuth } from "@/providers/AuthProvider";
import ModelSelector from "./selectors/ModelSelector";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
} from "@/features/generation/enums/models.enum";
import {
  GenerationTypeEnum,
  ModelsValidatorSchemaMap,
} from "../../types/generation";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
import {
  useGenerateMutation,
  useGenerationCostQuery,
} from "../../hooks/generation";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

interface PromptComposerFooterProps {
  children: React.ReactNode;
  isFocused: boolean;
}

export default function PromptComposerFooter({
  children,
  isFocused,
}: PromptComposerFooterProps) {
  const { model, projectId, mediaType} = useAiGenerationControlStore();
  const { data } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const { states, setField } = useAiModelStore();
  const { prompt } = states[model]!;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isEnhancing, setIsEnhancing] = useState(false);
   const queryClient = useQueryClient();
  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/generation/prompt-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const json = await res.json();
      if (json.data?.prompt) {
        setField(model, "prompt", json.data.prompt);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };
  const isFormValid = () => {
    const validator = ModelsValidatorSchemaMap[model];
    return validator.safeParse(states[model]).success;
  };
  const handleGeneration = async () => {
    try {
      const state = states[model];

      if (!state) {
        throw new Error("No state for selected model");
      }
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      const payload = {
        model,
        projectId,
        mediaType,
        input: state,
      };
      await generation!.mutateAsync(payload);
      if (pathname !== "/create") {
        router.push("/create");
        return;
      }
      
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <div
      className={`z-50 transition-all duration-500 ease-in-out overflow-visible ${
        isFocused ? "max-h-[300px] opacity-100 " : "max-h-0 opacity-0 "
      }`}
    >
      <div className="flex items-center justify-between  xs:flex-row flex-col ">
        <div className="flex items-center flex-wrap xs:w-auto w-full justify-start gap-2 xs:order-1 order-2">
          {mediaType && (
            <ModelSelector
              models={
                mediaType === GenerationTypeEnum.VIDEO
                  ? VIDEO_MODELS
                  : mediaType === GenerationTypeEnum.AUDIO
                  ? AUDIO_MODELS
                  : IMAGE_MODELS
              }
            />
          )}
          {children}
        </div>
        <div className="flex items-center xs:w-auto w-full justify-between xs:justify-start xs:gap-2 xs:order-2 order-1">
          {user && <ProjectSelector />}

          {/* Enhance prompt */}
          <div className="relative group">
            <a
              href="https://smplprompt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 transition-all duration-200 hover:bg-white/10"
            >
              <Image src="/robot.png" alt="Enhance prompt" width={24} height={24} className="object-contain" />
            </a>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-black/80 text-white/80 border border-white/10">
              Enhance prompt
            </div>
          </div>

          <Button
            type="button"
            variant={"primary"}
            className="text-sm p-3"
            onClick={handleGeneration}
            disabled={!isFormValid()}
          >
            {false ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <div className="flex flex-row items-center gap-1">
                  <div>Create</div>
                  <div className="text-sm text-white/50">|</div>
                  <div className="flex flex-row items-center opacity-50 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {data?.creditsCost ?? 0}
                  </div>
                </div>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
