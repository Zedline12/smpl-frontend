/** Same union as brands/generation — "success"/"failure", not clipping's "completed"/"failed". */
export type VideoAnalysisProjectStatus =
  "pending" | "processing" | "success" | "failure";

export const ACTIVE_STATUSES: VideoAnalysisProjectStatus[] = [
  "pending",
  "processing",
];

export function isActiveStatus(status: VideoAnalysisProjectStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

/**
 * What an analysis makes:
 * - remake: fixed-length scenes, each with a prompt to remake it with AI.
 * - script: the video's script, in sections with timestamps.
 */
export type VideoAnalysisType = "remake" | "script";

export const ANALYSIS_TYPES: {
  value: VideoAnalysisType;
  label: string;
  description: string;
}[] = [
  {
    value: "remake",
    label: "Remake prompts",
    description: "A prompt for every scene, ready to remake the video with AI",
  },
  {
    value: "script",
    label: "Script",
    description: "The script, split into sections with timestamps",
  },
];

export const analysisTypeLabel = (type: VideoAnalysisType | undefined) =>
  type === "script" ? "Script" : "Remake prompts";

/** One remake scene, or one script section (which leaves visual and prompt empty). */
export interface VideoAnalysisScene {
  id: string;
  videoAnalysisProjectId: string;
  index: number;
  startTime: number;
  endTime: number;
  /** Script: what the section does, e.g. "Hook". */
  title?: string;
  /** Script: who speaks, when it's clear. */
  speaker?: string;
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
  /** Missing on analyses from before scripts: those are remake. */
  type?: VideoAnalysisType;
  /** Remake only. */
  sceneDurationSeconds: 4 | 6 | 8 | null;
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
  type: VideoAnalysisType;
  /** Remake only. */
  sceneDurationSeconds?: 4 | 6 | 8;
  name?: string;
  prompt?: string;
}

export interface VideoAnalysisCost {
  durationSeconds: number;
  creditsCost: number;
}
