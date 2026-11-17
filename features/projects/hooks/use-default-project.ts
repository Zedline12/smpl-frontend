import { useEffect } from "react";
import { useProjectsQuery } from "@/features/projects/hooks/projects";
import { useAiGenerationControlStore } from "@/stores/useAiGenerationControlStore";

/**
 * Generations need a project. Pages without a project picker (Artist, Ads Studio)
 * use the first one, which is what the project picker elsewhere defaults to.
 */
export function useDefaultProject(enabled: boolean) {
  const { projectId, setProjectId } = useAiGenerationControlStore();
  const { data: projects = [] } = useProjectsQuery();
  useEffect(() => {
    if (enabled && !projectId && projects.length > 0)
      setProjectId(projects[0].id);
  }, [enabled, projects, projectId, setProjectId]);
}
