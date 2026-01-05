import { useState, useEffect } from "react";
import { projectsService } from "@/lib/api/services/projects.service";
import { Project, Media } from "@/lib/types/project.type";

interface UseProjectReturn {
  project: (Project & { media: Media[] }) | null;
  isLoading: boolean;
  error: string | null;
}

export function useProject(id: string): UseProjectReturn {
  const [project, setProject] = useState<(Project & { media: Media[] }) | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        const data = await projectsService.getProject(id);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch project");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return { project, isLoading, error };
}
