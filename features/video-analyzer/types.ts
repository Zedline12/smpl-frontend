/** Same union as brand-themes/generation — "success"/"failure", not clipping's "completed"/"failed". */
export type VideoAnalysisProjectStatus =
  | "pending"
  | "processing"
  | "success"
  | "failure";

export const ACTIVE_STATUSES: VideoAnalysisProjectStatus[] = [
  "pending",
  "processing",
];

export function isActiveStatus(status: VideoAnalysisProjectStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface VideoAnalysisScene {
  id: string;
  videoAnalysisProjectId: string;
  index: number;
  startTime: number;
  endTime: number;
  visual: string;
  dialogue: string;
  onScreenText: string;
  /** Ready-to-use generation prompt to recreate this scene. */
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoAnalysisProject {
  id: string;
  userId: string;
  originalVideoUrl: string;
  name: string;
  status: VideoAnalysisProjectStatus;
  sceneDurationSeconds: 4 | 6 | 8;
  durationSeconds: number | null;
  totalScenes: number | null;
  /** Only populated by the single-item fetch, not by the list/queues endpoints. */
  scenes?: VideoAnalysisScene[];
  creditsUsed: number;
  errorMessage: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoAnalysisRequest {
  videoUrl: string;
  sceneDurationSeconds: 4 | 6 | 8;
  name?: string;
  prompt?: string;
}
