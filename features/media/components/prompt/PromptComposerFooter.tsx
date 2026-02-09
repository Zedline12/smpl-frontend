"use client";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import { Button } from "@/components/ui/button";
import ProjectSelector from "./selectors/ProjectSelector";
import { useAuth } from "@/providers/AuthProvider";

interface PromptComposerFooterProps {
  children: React.ReactNode;
  onGeneration: () => void;
  disabled: boolean;
  isGenerating: boolean;
  creditsCost: number;
  isFocused: boolean;
}
export default function PromptComposerFooter({
  children,
  onGeneration,
  disabled,
  isGenerating,
  creditsCost,
  isFocused,
}: PromptComposerFooterProps) {
  const { projectId, setProjectId } = useImageGenerationStore();
  const { user } = useAuth();
  return (
    <div
      className={`z-50 transition-all duration-500 ease-in-out  ${
        isFocused ? "max-h-[100px] opacity-100 " : "max-h-0 opacity-0 "
      }`}
    >
      <div className="flex items-center justify-between  xs:flex-row flex-col ">
        <div className="flex items-center xs:w-auto w-full justify-start xs:gap-2 xs:order-1 order-2">
          {children}
        </div>
        <div className="flex items-center xs:w-auto w-full justify-between xs:justify-start xs:gap-2 xs:order-2 order-1">
          {user && (
            <ProjectSelector />
          )}
          <Button
            type="button"
            variant={"primary"}
            className="text-sm p-3"
            onClick={onGeneration}
            disabled={disabled}
          >
            {isGenerating ? (
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

                    {creditsCost ?? 0}
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
