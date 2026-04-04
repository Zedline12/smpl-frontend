"use client";
import { Button } from "@/components/ui/button";
import ProjectSelector from "./selectors/ProjectSelector";
import { useAuth } from "@/providers/AuthProvider";
import ModelSelector from "./selectors/ModelSelector";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
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

interface PromptComposerFooterProps {
  children: React.ReactNode;
  isFocused: boolean;
}

export default function PromptComposerFooter({
  children,
  isFocused,
}: PromptComposerFooterProps) {
  const { model, projectId, mediaType } = useAiGenerationControlStore();
  const { data } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const { states } = useAiModelStore();
  const { prompt } = states[model]!;
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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
                  : IMAGE_MODELS
              }
            />
          )}
          {children}
        </div>
        <div className="flex items-center xs:w-auto w-full justify-between xs:justify-start xs:gap-2 xs:order-2 order-1">
          {user && <ProjectSelector />}
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
