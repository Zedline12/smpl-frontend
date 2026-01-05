import { useState, useEffect } from "react";
import { projectsService } from "@/lib/api/services/projects.service";
import { Project } from "@/lib/types/project.type";

interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsService.getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return { projects, isLoading, error };
}
