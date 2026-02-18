import { useVideoGenerationStore } from "@/stores/useVideoGenerationStore";
import ResolutionSelector from "./selectors/ResolutionSelector";
import {
  VIDEO_RESOLUTIONS,
  VideoResolution,
  VIDEO_ASPECT_RATIOS,
  VideoAspectRatio,
  VIDEO_DURATION_SECONDS,
  VideoDuration,
} from "@/features/media/types/media";
import AspectRatioSelector from "./selectors/AspectRatioSelector";
import DurationSelector from "./selectors/DurationSelector";
import ProjectSelector from "./selectors/ProjectSelector";
import { useEffect } from "react";
import { useProjectsQuery } from "@/features/projects/hooks/projects";

export default function CreateVideoParameter() {
  const {
    resolution,
    aspectRatio,
    durationSeconds,
    referenceImages,
    projectId,
    setResolution,
    setAspectRatio,
    setDurationSeconds,
    setProjectId,
    reset,
  } = useVideoGenerationStore();

  const { data: projects = [] } = useProjectsQuery();

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  // Logic from store: if 1080p/4K OR reference images exist, duration is forced to 8.
  // We should disable the duration selector or show it as disabled if forced?
  // "if resolution ... is choosed ... then duration is set to 8"
  // If I disable it, the user sees why it's 8.

  const isDurationForced =
    resolution === "1080p" ||
    resolution === "4k" ||
    referenceImages.some((img) => img !== null);

  return (
    <div className="bg-neutral-900 w-full h-full p-5 flex flex-col gap-5">
      <div onClick={reset} className="cursor-pointer flex justify-end mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <path
            fillRule="evenodd"
            d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <ProjectSelector
        projects={projects}
        selectedProjectId={projectId}
        onSelect={setProjectId}
      />

      <ResolutionSelector
        options={VIDEO_RESOLUTIONS}
        value={resolution}
        onChange={(v) => setResolution(v as VideoResolution)}
      />
      <AspectRatioSelector
        options={VIDEO_ASPECT_RATIOS}
        value={aspectRatio}
        onChange={(v) => setAspectRatio(v as VideoAspectRatio)}
      />
      <DurationSelector
        options={VIDEO_DURATION_SECONDS}
        value={durationSeconds}
        onChange={(v) => setDurationSeconds(v as VideoDuration)}
        disabled={isDurationForced}
      />
    </div>
  );
}
