import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Media } from "@/features/media/types/media";
import { markMediaDownloaded } from "@/features/media/api/media";
import { downloadName } from "@/features/media/utils/media-actions";
import { downloadFile, downloadUrlsZip } from "@/lib/handle-downloads";
import { AiModelsEnum } from "@/features/generation/enums/models.enum";
import { GenerationTypeEnum } from "@/features/generation/types/generation";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";

type MediaPage = { data: Media[]; totalCount: number; limit: number };

async function postJson(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Something went wrong");
  return json;
}

function usePatchMediaInCache() {
  const queryClient = useQueryClient();
  return (ids: string[], patch: Partial<Media>) =>
    queryClient.setQueriesData<InfiniteData<MediaPage>>(
      { queryKey: ["media"] },
      (data) =>
        data?.pages
          ? {
              ...data,
              pages: data.pages.map((page) => ({
                ...page,
                data: page.data.map((m) => (ids.includes(m.id) ? { ...m, ...patch } : m)),
              })),
            }
          : data,
    );
}

export function useToggleLikeMutation() {
  const patchMedia = usePatchMediaInCache();

  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      postJson(`/api/media/${id}/like`, "PATCH", { liked }),
    onMutate: ({ id, liked }) => patchMedia([id], { liked }),
    onError: (error, { id, liked }) => {
      patchMedia([id], { liked: !liked });
      toast.error(error.message);
    },
  });
}

/** Downloads one file, or a zip for several, and records them as downloaded. */
export function useDownloadMedia() {
  const patchMedia = usePatchMediaInCache();

  return (items: Media[]) => {
    if (items.length === 0) return;
    if (items.length === 1) {
      const [m] = items;
      downloadFile(m.url, downloadName(m.id, m.url));
    } else {
      downloadUrlsZip(items.map((m) => m.url), "smpl-media");
    }
    const ids = items.filter((m) => !m.isTemplate && !m.downloaded).map((m) => m.id);
    if (ids.length === 0) return;
    patchMedia(ids, { downloaded: true });
    markMediaDownloaded(ids).catch(() => undefined);
  };
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      postJson("/api/media/bulk-delete", "POST", { ids }),
    onSuccess: (_data, ids) => {
      toast.success(ids.length > 1 ? `Deleted ${ids.length} items` : "Deleted");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useMoveMediaMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, projectId }: { ids: string[]; projectId: string }) =>
      postJson("/api/media/bulk-move", "POST", { ids, projectId }),
    onSuccess: (_data, { ids }) => {
      toast.success(ids.length > 1 ? `Moved ${ids.length} items` : "Moved");
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Where each model's composer lives; everything else uses /create. */
const COMPOSER_ROUTES: Partial<Record<AiModelsEnum, string>> = {
  [AiModelsEnum.SMPL_GENSU]: "/create/motion-transfer",
  [AiModelsEnum.SMPL_REMIX]: "/remix",
  [AiModelsEnum.HIGGSFIELD_AI_INFLUENCER]: "/ai-influencer-studio",
  [AiModelsEnum.HIGGSFIELD_ADS_STUDIO]: "/create/image?model=higgsfield-ads-studio",
  [AiModelsEnum.ELEVENLABS_MUSIC_V2_5]: "/artist",
  [AiModelsEnum.FAL_SEEDANCE_2_5]: "/artist?tab=clip",
  [AiModelsEnum.SEEDANCE_2_5]: "/create/video",
  [AiModelsEnum.SMPL_ARTIST]: "/artist?tab=clip",
  // Its result is a video, but the model lives on the audio page.
  [AiModelsEnum.SMPL_VOICE_CHANGER]: "/create/audio?model=smpl-voice-changer",
};

/** Loads a media's model and settings into the composer and takes the user there. */
export function useRecreateMedia() {
  const router = useRouter();
  const pathname = usePathname();
  const { setModel, setMediaType, setProjectId } = useAiGenerationControlStore();
  const { setField } = useAiModelStore();

  return (media: Media) => {
    const model = media.model as AiModelsEnum;
    if (!model) {
      toast.error("This item has no settings to recreate from");
      return;
    }
    let input: Record<string, unknown> = { ...(media.input ?? {}) };
    // Seedance 2.5 now works from references: old start/end frames become reference images.
    if (model === AiModelsEnum.SEEDANCE_2_5) {
      const old = input as { imageUrl?: string; endImageUrl?: string; images?: string[]; videoUrl?: string; videos?: string[]; audios?: string[] };
      input = {
        ...input,
        imageUrl: "",
        endImageUrl: "",
        videoUrl: "",
        images: [old.imageUrl, old.endImageUrl, ...(old.images ?? [])].filter(Boolean).slice(0, 9),
        videos: [old.videoUrl, ...(old.videos ?? [])].filter(Boolean).slice(0, 3),
        audios: old.audios ?? [],
      };
    }
    setMediaType(media.type as GenerationTypeEnum);
    setModel(model);
    Object.entries(input).forEach(([key, value]) => setField(model, key, value));
    if (media.projectId) setProjectId(media.projectId);

    const target = COMPOSER_ROUTES[model] ?? "/create";
    if (pathname !== target) router.push(target);
    toast.success("Settings loaded. Tweak them and hit Create.");
  };
}
