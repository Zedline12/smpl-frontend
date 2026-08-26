/**
 * NOTE: this union is "completed" | "failed" — NOT the "success" | "failure"
 * used by the generation queues and brand themes. Copying those predicates
 * across would leave the poll running forever.
 */
export type VideoClippingStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export const ACTIVE_STATUSES: VideoClippingStatus[] = ["pending", "processing"];

export function isActiveStatus(status: VideoClippingStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface VideoClip {
  providerVideoId: number;
  videoUrl: string;
  videoMsDuration: number;
  title: string;
  transcript: string;
  /** A string on the wire — parse with `parseViralScore`. */
  viralScore: string;
  viralReason: string;
  relatedTopic: string;
  providerClipEditorUrl: string;
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
  clips: VideoClip[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoClippingRequest {
  videoUrl: string;
  lang: string;
  preferLength: number[];
  videoType: number;
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
