/** Same union as brand-themes/generation — "success"/"failure", not clipping's "completed"/"failed". */
export type VideoAnalysisStatus = "pending" | "processing" | "success" | "failure";

export const ACTIVE_STATUSES: VideoAnalysisStatus[] = ["pending", "processing"];

export function isActiveStatus(status: VideoAnalysisStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export interface VideoAnalysisScene {
  timestamp: string;
  visual: string;
  dialogue: string;
  onScreenText: string;
}

export interface VideoAnalysis {
  id: string;
  userId: string;
  youtubeUrl: string;
  name: string;
  status: VideoAnalysisStatus;
  scenes: VideoAnalysisScene[];
  durationSeconds: number | null;
  creditsUsed: number;
  errorMessage: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVideoAnalysisRequest {
  videoUrl: string;
  name?: string;
  prompt?: string;
}
