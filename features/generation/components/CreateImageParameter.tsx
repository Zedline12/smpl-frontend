"use client";
import { useImageGenerationStore } from "@/stores/useImageGenerationStore";
import ResolutionSelector from "./selectors/ResolutionSelector";
import {
  IMAGE_RESOLUTIONS,
  ImageResolution,
  IMAGE_ASPECT_RATIOS,
  ImageAspectRatio,
} from "@/features/media/types/media";
import AspectRatioSelector from "./selectors/AspectRatioSelector";
import ProjectSelector from "./selectors/ProjectSelector";
import { useEffect } from "react";
import { useProjectsQuery } from "@/features/projects/hooks/projects";

export default function CreateImageParameter() {
  const {
    resolution,
    aspectRatio,
    projectId,
    setResolution,
    setAspectRatio,
    setProjectId,
  } = useImageGenerationStore();
  const resetStore = useImageGenerationStore((s) => s.reset);

  const { data: projects = [] } = useProjectsQuery();

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0].id);
    }
  }, [projects, projectId, setProjectId]);

  return (
    <div className="bg-background-light w-full h-full p-5 flex flex-col gap-5">
      <div
        onClick={resetStore}
        className="cursor-pointer flex justify-end mb-3"
      >
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
        options={IMAGE_RESOLUTIONS}
        value={resolution}
        onChange={(v) => setResolution(v as ImageResolution)}
      />
      <AspectRatioSelector
        options={IMAGE_ASPECT_RATIOS}
        value={aspectRatio}
        onChange={(v) => setAspectRatio(v as ImageAspectRatio)}
      />
    </div>
  );
}
