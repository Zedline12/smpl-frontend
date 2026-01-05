import { apiFetch } from "@/lib/api/client";

export type MediaType = "image" | "video";

export interface GenerateMediaRequest {
  prompt: string;
  mediaType: MediaType;
  projectId: string;
}

export const aiMediaService = {
  async generateMedia(data: GenerateMediaRequest) {
    return await apiFetch("ai-media/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
