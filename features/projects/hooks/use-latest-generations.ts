import { useState, useEffect } from "react";
import { projectsService } from "@/lib/api/services/projects.service";
import { Media } from "@/lib/types/project.type";

interface UseLatestGenerationsReturn {
  latestGenerations: Media[];
  isLoading: boolean;
  error: string | null;
}

export function useLatestGenerations(): UseLatestGenerationsReturn {
  const [latestGenerations, setLatestGenerations] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const data = await projectsService.getLatestGenerations();
        setLatestGenerations(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch latest generations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatest();
  }, []);

  return { latestGenerations, isLoading, error };
}
