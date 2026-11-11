/**
 * NOTE: this union is "completed" | "failed" — NOT the "success" | "failure"
 * used by the generation queues and brand themes. Copying those predicates
 * across would leave the poll running forever.
 */
export type VideoClippingStatus =
  | "pending"
  | "processing"
  | "completed"
  /** Some shapes finished, others failed (and were refunded). */
  | "partial"
  | "failed";

export type VideoClippingOutputStatus = "pending" | "processing" | "completed" | "failed";

export const ACTIVE_STATUSES: VideoClippingStatus[] = ["pending", "processing"];

export function isActiveStatus(status: VideoClippingStatus | VideoClippingOutputStatus): boolean {
  return status === "pending" || status === "processing";
}

/** AI-written post text for one platform. */
export interface ClipPostCopy {
  title: string;
  caption: string;
  hashtags: string[];
}

export interface VideoClip {
  providerVideoId: number;
  videoUrl: string;
  videoMsDuration: number;
  title: string;
  transcript: string;
  /** A string on the wire — parse with `parseViralScore`. */
  viralScore: string;
  /** The same score as 0–100 (null when unreadable). */
  viralScoreNum?: number | null;
  viralReason: string;
  relatedTopic: string;
  providerClipEditorUrl: string;
  /** Post copy per platform id. */
  postCopy?: Record<string, ClipPostCopy> | null;
  savedMediaId?: string | null;
}

/** One shape's clips (one Vizard job). */
export interface VideoClippingOutput {
  ratio: number;
  ratioLabel: string;
  platforms: string[];
  preferLength: number[];
  providerProjectId: string;
  status: VideoClippingOutputStatus;
  errorMessage: string | null;
  clips: VideoClip[];
  creditsUsed: number;
  refundedAt: string | null;
  startedAt?: string | null;
}

export interface VideoClippingProject {
  id: string;
  providerProjectId: string;
  originalVideoUrl: string;
  lang: string;
  preferLength: number[];
  videoType: number;
  ratioOfClip: number | null;
  templateId: number | null;
  maxClipNumber: number | null;
  keyword: string | null;
  projectName: string | null;
  clipModel: string | null;
  removeSilence: boolean;
  subtitles: boolean;
  headline: boolean;
  status: VideoClippingStatus;
  errorMessage: string | null;
  /** Every clip of every shape. */
  clips: VideoClip[];
  platforms: string[];
  sourceKind: "link" | "upload";
  outputs: VideoClippingOutput[];
  /** Expected clipping time in seconds (for the progress bar). */
  estimatedSeconds?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClippingCost {
  sourceDurationMinutes: number | null;
  creditsCost: number;
  shapes?: number;
  creditsPerShape?: number;
}

export interface CreateVideoClippingRequest {
  videoUrl: string;
  lang: string;
  /** Missing = each platform's best lengths. */
  preferLength?: number[];
  videoType: number;
  platforms?: string[];
  sourceKind?: "link" | "upload";
  ext?: string;
  ratioOfClip?: number;
  templateId?: number;
  maxClipNumber?: number;
  keyword?: string;
  projectName?: string;
  clipModel?: string;
  removeSilence?: boolean;
  subtitles?: boolean;
  headline?: boolean;
}
