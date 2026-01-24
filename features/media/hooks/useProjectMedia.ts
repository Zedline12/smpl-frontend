"use client";

import { Media } from "@/features/media/types/media";
import { useEffect, useState } from "react";

export function useProjectMedia(projectId?: string) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/media/me?projectId=${projectId}`)
      .then((res) => res.json())
      .then((res) => setMedia(res.data))
      .finally(() => setLoading(false));
  }, [projectId]);

  return { media, loading };
}
