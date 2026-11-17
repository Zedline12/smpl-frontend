"use client";

import ModelSelector from "./selectors/ModelSelector";
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
  isEditTool,
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
import { useAuth } from "@/providers/AuthProvider";
import { useDefaultProject } from "@/features/projects/hooks/use-default-project";
import { useGenerateTemplateMutation } from "@/features/media/hooks/useTemplates";

interface PromptComposerFooterProps {
  children: React.ReactNode;
  isFocused: boolean;
  editMode?: boolean;
}

export default function PromptComposerFooter({
  children,
  isFocused,
  editMode,
}: PromptComposerFooterProps) {
  const { model, projectId, mediaType, templateMode } =
    useAiGenerationControlStore();
  const { data } = useGenerationCostQuery();
  const generation = useGenerateMutation();
  const templateGeneration = useGenerateTemplateMutation();
  const { states } = useAiModelStore();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // No project picker: generations go to the first project.
  useDefaultProject(!!user && !templateMode);
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
      // Admin template page: no project, no redirect.
      if (templateMode) {
        await templateGeneration.mutateAsync({ model, mediaType, input: state });
        return;
      }
      const payload = {
        model,
        projectId,
        mediaType,
        input: state,
      };
      await generation!.mutateAsync(payload);
      if (
        pathname !== "/create" &&
        !pathname.startsWith("/create/motion-transfer")
      ) {
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Phones: the model picker on its own full-width row, then the settings filling a
            two-column grid. From sm: one packed row. Menu triggers carry their own p-2; drop it. */}
        <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="w-full sm:w-auto [&>div]:w-full [&>div>button]:w-full [&>div>button]:p-0 [&>div>button>div]:w-full sm:[&>div]:w-auto sm:[&>div>button]:w-auto sm:[&>div>button>div]:w-auto">
          {mediaType && (
            <ModelSelector
              models={
                (mediaType === GenerationTypeEnum.VIDEO
                  ? VIDEO_MODELS
                  : mediaType === GenerationTypeEnum.AUDIO
                  ? AUDIO_MODELS
                  : IMAGE_MODELS
                ).filter((m) => !isEditTool(m.id))
              }
            />
          )}
          </div>
          <div className="composer-settings flex flex-wrap items-center gap-1.5 [&_[data-menu-trigger]]:p-0">
            {children}
          </div>
        </div>
        {/* Full-width Create on phones. */}
        <div className="flex w-full items-center sm:w-auto">

          {/* Glassy glow Create button */}
          {!editMode && <div className="relative group/btn w-full sm:w-auto">
            {/* Wide outer glow */}
            <div
              className={`absolute -inset-2 rounded-full blur-xl pointer-events-none transition-opacity duration-500 ${
                isFormValid()
                  ? "opacity-50 group-hover/btn:opacity-80"
                  : "opacity-[0.07]"
              }`}
              style={{ background: "var(--gradient-create)" }}
            />
            {/* Tight inner glow */}
            <div
              className={`absolute -inset-0.5 rounded-full blur-sm pointer-events-none transition-opacity duration-300 ${
                isFormValid()
                  ? "opacity-80 group-hover/btn:opacity-100"
                  : "opacity-[0.12]"
              }`}
              style={{ background: "var(--gradient-create)" }}
            />
            {/* Gradient border */}
            <div
              className={`relative w-full rounded-full p-px transition-transform duration-200 ${
                isFormValid() ? "group-hover/btn:scale-[1.03]" : ""
              }`}
              style={{ background: "var(--gradient-create)" }}
            >
              <button
                type="button"
                onClick={handleGeneration}
                disabled={!isFormValid()}
                className={`cursor-pointer relative flex w-full items-center justify-center rounded-full backdrop-blur-md px-4 py-2 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed ${
                  isFormValid()
                    ? "bg-black/65 text-white group-hover/btn:bg-black/45"
                    : "bg-black/80 text-white/30"
                }`}
              >
                {false ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-1">
                    <span>Create</span>
                    <span className="text-white/40 mx-0.5">|</span>
                    <span className="flex flex-row items-center opacity-60">
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
                    </span>
                  </div>
                )}
              </button>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
