import { Media } from "@/features/media/types/media";

export type Project = {
  id: string;
  name: string;
  isMain: boolean;
  hexCode?: string;
  createdAt: string;
  updatedAt: string;
}
export type ProjectStats = {
  totalVideos: number;
  totalImages: number;
  totalAudio: number;
};

export type ProjectWithStats = Project & {
  stats: ProjectStats;
};

export type ProjectWithMedia = Project & {
  media: Media[];
};

export type ProjectWithStatsAndMedia = Project & {
  stats: ProjectStats;
  media: Media[];
};
