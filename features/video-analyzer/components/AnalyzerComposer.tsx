"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUp,
  FileText,
  Loader2,
  SlidersHorizontal,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ComposerChip,
  PICKER_CONTENT_CLASS,
  PickerHeader,
} from "@/features/ads-studio/components/composer/ComposerChip";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { cn } from "@/lib/utils";
import {
  useCreateVideoAnalysisMutation,
  useVideoAnalysisCostQuery,
} from "../hooks/use-video-analyzer";
import { ANALYSIS_TYPES, VideoAnalysisType } from "../types";
import { formatDuration } from "../utils";

/** Same 4/6/8s increments Veo 3 uses, so each scene's prompt fits one clip. */
const SCENE_LENGTHS: Array<4 | 6 | 8> = [4, 6, 8];
const TYPE_ICONS = { remake: Wand2, script: FileText } as const;
const PLACEHOLDERS: Record<VideoAnalysisType, string> = {
  remake:
    'Anything to focus on? e.g. "Keep the product shots, swap the presenter for a cartoon fox"…',
  script: 'Anything to focus on? e.g. "Only the voiceover, skip the captions"…',
};

const segment = (active: boolean) =>
  cn(
    "flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors",
    active ? "bg-white text-black" : "text-white/60 hover:text-white",
  );

/**
 * The Video Analyzer prompt box: what to make (remake prompts or a script), the
 * video, optional focus notes and, for remakes, the scene length.
 */
export function AnalyzerComposer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [type, setType] = useState<VideoAnalysisType>("remake");
  const [videoUrl, setVideoUrl] = useState<string>();
  const [focus, setFocus] = useState("");
  const [sceneLength, setSceneLength] = useState<4 | 6 | 8>(8);
  const [videoOpen, setVideoOpen] = useState(false);

  const create = useCreateVideoAnalysisMutation();
  const cost = useVideoAnalysisCostQuery(videoUrl, type);
  const canSubmit = !!videoUrl && !create.isPending && !cost.isError;

  const submit = () => {
    if (!canSubmit || !videoUrl) return;
    create.mutate(
      {
        videoUrl,
        type,
        ...(type === "remake" ? { sceneDurationSeconds: sceneLength } : {}),
        ...(focus.trim() ? { prompt: focus.trim() } : {}),
      },
      {
        onSuccess: (analysis) => {
          queryClient.invalidateQueries({ queryKey: ["current-user"] });
          setVideoUrl(undefined);
          setFocus("");
          toast.success(
            type === "script"
              ? "Writing out the script…"
              : "Making remake prompts…",
            {
              action: {
                label: "View",
                onClick: () =>
                  router.push(`/video-analyzer/analyses/${analysis.id}`),
              },
            },
          );
        },
      },
    );
  };

  return (
    <div className="flex w-full flex-col gap-3">
      {/* What to make */}
      <div
        role="radiogroup"
        aria-label="What to make"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {ANALYSIS_TYPES.map((t) => {
          const Icon = TYPE_ICONS[t.value];
          const active = type === t.value;
          return (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors",
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:border-white/20",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl",
                  active
                    ? "bg-primary text-white"
                    : "bg-white/[0.06] text-white/60",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-semibold text-white">
                  {t.label}
                </span>
                <span className="text-xs leading-snug text-white/50">
                  {t.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="w-full rounded-[22px] border border-white/10 bg-[#111115]/90 p-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl focus-within:border-white/20">
        {videoUrl && (
          <div className="mb-2 flex items-center gap-3 px-1">
            <span className="group relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
              <video
                src={`${videoUrl}#t=0.5`}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
              <button
                type="button"
                aria-label="Remove video"
                onClick={() => setVideoUrl(undefined)}
                className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X className="size-3" />
              </button>
            </span>
            <span className="text-xs text-white/50">
              {cost.isLoading
                ? "Reading the video…"
                : cost.isError
                  ? (cost.error as Error).message
                  : cost.data
                    ? `${formatDuration(cost.data.durationSeconds)} long`
                    : null}
            </span>
          </div>
        )}

        <textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          maxLength={2000}
          rows={3}
          aria-label="Focus notes (optional)"
          placeholder={PLACEHOLDERS[type]}
          className="w-full resize-none bg-transparent px-2 pt-1 text-[15px] leading-relaxed text-white outline-none placeholder:text-white/35"
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <ComposerChip
              icon={Video}
              label="Add video"
              value={videoUrl ? "Change video" : undefined}
              onClick={() => setVideoOpen(true)}
            />
            {type === "remake" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ComposerChip
                    icon={SlidersHorizontal}
                    label="Settings"
                    value={`${sceneLength}s scenes`}
                    className="border-white/[0.08] bg-white/[0.05] text-white/80"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  align="start"
                  sideOffset={8}
                  collisionPadding={8}
                  className={cn(PICKER_CONTENT_CLASS, "w-72 p-3")}
                >
                  <PickerHeader title="Scene length" />
                  <div className="flex rounded-lg border border-white/10 p-1">
                    {SCENE_LENGTHS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSceneLength(s)}
                        className={segment(sceneLength === s)}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 px-1 text-xs text-white/45">
                    Each scene gets its own prompt, sized for one AI video clip.
                  </p>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {cost.data && (
              <span className="text-xs text-white/45 tabular-nums">
                {cost.data.creditsCost} credits
              </span>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              aria-label={
                type === "script" ? "Get the script" : "Get remake prompts"
              }
              className="bg-primary hover:bg-primary/90 flex size-9 shrink-0 items-center justify-center rounded-xl text-white transition-colors disabled:cursor-not-allowed disabled:opacity-35"
            >
              {create.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      <MediaManagerDialog
        open={videoOpen}
        onOpenChange={setVideoOpen}
        selectedImage={videoUrl}
        onSelect={(urls) => setVideoUrl(urls[0])}
        mediaType="video"
        maxSelections={1}
      />
    </div>
  );
}
