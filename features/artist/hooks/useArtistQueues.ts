"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGenerationQueuesQuery } from "@/features/generation/hooks/generation";
import { GenerationQueue } from "@/features/generation/types/generation";
import { MediaType } from "@/features/media/types/media";

/**
 * The page's running jobs of one media type (songs or clips), the same rules MediaExplorer
 * uses: jobs without a saved media are shown as tiles, finished ones refresh the library.
 */
export function useArtistQueues(type: MediaType) {
  const queryClient = useQueryClient();
  const { data: queues } = useGenerationQueuesQuery();
  const refreshed = useRef(new Set<string>());
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const ofType = useMemo(() => (queues ?? []).filter((q) => q.type === type), [queues, type]);

  const running = useMemo(
    () =>
      ofType.filter(
        (q) =>
          (["pending", "processing"].includes(q.status) && !q.mediaId) ||
          // Provider done, still uploading to storage.
          (q.status === "success" && !!q.providerUrl && !q.mediaId),
      ),
    [ofType],
  );

  const failed: GenerationQueue | undefined = ofType.find(
    (q) => q.status === "failure" && !dismissed.has(q.id),
  );
  const dismiss = (id: string) => setDismissed((prev) => new Set(prev).add(id));

  // Finished jobs: the media (and credits) changed.
  useEffect(() => {
    let changed = false;
    (queues ?? []).forEach((q) => {
      if (q.status === "success" && q.mediaId && !refreshed.current.has(q.id)) {
        refreshed.current.add(q.id);
        changed = true;
      }
    });
    if (!changed) return;
    queryClient.invalidateQueries({ queryKey: ["media"] });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    queryClient.invalidateQueries({ queryKey: ["current-user"] });
    queryClient.invalidateQueries({ queryKey: ["user-models"] });
  }, [queues, queryClient]);

  return { running, failed, dismiss };
}
