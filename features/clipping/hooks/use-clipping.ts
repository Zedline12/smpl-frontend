import { useLiveStore } from "@/features/live/store";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createClippingProject,
  deleteClippingProject,
  fetchClippingCost,
  fetchClippingProject,
  fetchClippingProjects,
  regenerateClipCopy,
  saveClipsToLibrary,
} from "../api";
import {
  CreateVideoClippingRequest,
  VideoClippingProject,
  isActiveStatus,
} from "../types";

// Clipping is slow work — a long interval keeps the poll cheap without the user
// noticing a difference.
const LIST_POLL_MS = 35_000;
const DETAIL_POLL_MS = 35_000;

const COST_DEBOUNCE_MS = 500;

export const clippingKeys = {
  all: ["video-clipping"] as const,
  detail: (id: string) => ["video-clipping", id] as const,
  cost: (videoUrl: string, platforms: string[], sourceKind: string) =>
    ["video-clipping", "cost", videoUrl, platforms.join(","), sourceKind] as const,
};

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Debounced so a valid URL forming mid-keystroke ("https://y.co") doesn't fire
 * a request per character. Re-prices when the platforms change (one charge per shape).
 */
export function useClippingCostQuery(
  videoUrl: string | null,
  platforms: string[],
  sourceKind: "link" | "upload",
) {
  const debouncedUrl = useDebouncedValue(videoUrl, COST_DEBOUNCE_MS);

  return useQuery({
    queryKey: clippingKeys.cost(debouncedUrl ?? "", platforms, sourceKind),
    queryFn: () => fetchClippingCost({ videoUrl: debouncedUrl!, platforms, sourceKind }),
    enabled: !!debouncedUrl,
    staleTime: 60_000,
    retry: 0,
  });
}

export function useClippingProjectsQuery() {
  return useQuery({
    queryKey: clippingKeys.all,
    queryFn: () => fetchClippingProjects(),
    staleTime: 15_000,
    retry: 0,
    // Self-stopping: poll only while something is still being clipped.
    // Live updates replace polling; polling only runs while the live stream is down.
    refetchInterval: (query) =>
      useLiveStore.getState().connected ? false :
      query.state.data?.some((project) => isActiveStatus(project.status))
        ? LIST_POLL_MS
        : false,
  });
}

/**
 * The detail view polls on the same rule, scoped to its own project — without
 * it, opening a processing project would sit frozen until a manual refresh.
 */
export function useClippingProjectQuery(id: string) {
  return useQuery({
    queryKey: clippingKeys.detail(id),
    queryFn: () => fetchClippingProject(id),
    enabled: !!id,
    retry: 0,
    // Live updates replace polling; polling only runs while the live stream is down.
    refetchInterval: (query) =>
      useLiveStore.getState().connected ? false :
      query.state.data && isActiveStatus(query.state.data.status)
        ? DETAIL_POLL_MS
        : false,
  });
}

export function useCreateClippingProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateVideoClippingRequest) =>
      createClippingProject(body),
    onSuccess: (project) => {
      queryClient.setQueryData<VideoClippingProject[]>(
        clippingKeys.all,
        (old) => (old ? [project, ...old] : [project]),
      );
      // refetch, not invalidate — this starts the poll immediately.
      queryClient.refetchQueries({ queryKey: clippingKeys.all });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteClippingProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClippingProject(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<VideoClippingProject[]>(clippingKeys.all, (old) =>
        old?.filter((p) => p.id !== id),
      );
      queryClient.removeQueries({ queryKey: clippingKeys.detail(id) });
      toast.success("Project deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Patches one clip inside a cached project. */
function patchClip(
  project: VideoClippingProject | undefined,
  videoId: number,
  patch: Record<string, unknown>,
): VideoClippingProject | undefined {
  if (!project) return project;
  const fix = <T extends { providerVideoId: number }>(c: T) =>
    c.providerVideoId === videoId ? { ...c, ...patch } : c;
  return {
    ...project,
    clips: project.clips.map(fix),
    outputs: project.outputs.map((o) => ({ ...o, clips: o.clips.map(fix) })),
  };
}

export function useRegenerateClipCopyMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: number) => regenerateClipCopy(projectId, videoId),
    onSuccess: ({ providerVideoId, postCopy }) => {
      queryClient.setQueryData<VideoClippingProject>(clippingKeys.detail(projectId), (old) =>
        patchClip(old, providerVideoId, { postCopy }),
      );
      toast.success("Captions rewritten");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSaveClipsMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoIds: number[]) => saveClipsToLibrary(projectId, videoIds),
    onSuccess: ({ saved }) => {
      queryClient.setQueryData<VideoClippingProject>(clippingKeys.detail(projectId), (old) =>
        saved.reduce((p, s) => patchClip(p, s.providerVideoId, { savedMediaId: s.mediaId }), old),
      );
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(saved.length === 1 ? "Saved to your library" : `${saved.length} clips saved to your library`);
    },
    onError: (error) => toast.error(error.message),
  });
}
