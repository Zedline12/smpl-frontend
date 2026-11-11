export type LiveItemKind = "job" | "clipping" | "brand-theme" | "video-analysis";
export type LiveStatus = "pending" | "processing" | "success" | "failure" | "removed";

/** One tracked job as the live stream sends it (same shape for every kind). */
export interface LiveItem {
  kind: LiveItemKind;
  id: string;
  status: LiveStatus;
  title?: string | null;
  model?: string | null;
  /** image | video | audio */
  type?: string | null;
  /** Job domain: media-generation, marketing-studio, clipping-studio… */
  domain?: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  estimatedSeconds?: number | null;
  mediaId?: string | null;
  templateId?: string | null;
  providerUrl?: string | null;
  failedMessage?: string | null;
  failedCategory?: string | null;
  refunded?: boolean;
  /** The kind's own object (job, clipping project, brand theme, analysis). */
  data?: unknown;
}

export const isActive = (status: string) => status === "pending" || status === "processing";
export const isFinished = (status: string) => status === "success" || status === "failure";

/** Store key: ids are only unique within a kind. */
export const liveKey = (item: Pick<LiveItem, "kind" | "id">) => `${item.kind}:${item.id}`;

/** Where to see the result. */
export function liveItemLink(item: LiveItem): string {
  switch (item.kind) {
    case "clipping":
      return `/clipping-studio/${item.id}`;
    case "brand-theme":
      return "/marketing-studio/brand-themes";
    case "video-analysis":
      return `/video-analyzer/analyses/${item.id}`;
    default:
      if (item.domain === "marketing-studio") return "/marketing-studio/my-creations";
      return "/assets";
  }
}

/** "Your video is ready" etc. */
export function liveItemLabel(item: LiveItem): string {
  switch (item.kind) {
    case "clipping":
      return "clips";
    case "brand-theme":
      return "brand theme";
    case "video-analysis":
      return "video analysis";
    default:
      return item.type === "video" ? "video" : item.type === "audio" ? "audio" : "image";
  }
}
