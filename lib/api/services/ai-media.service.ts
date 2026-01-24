import { apiFetch } from "@/lib/api/client";
import { GenerateMediaRequest, Resolution } from "@/lib/types/ai-media.type";

export const aiMediaService = {
  async generateMedia(data: GenerateMediaRequest) {
    let body: any = JSON.stringify(data);

    if (data.referenceImages && data.referenceImages.length > 0) {
      const formData = new FormData();
      formData.append("prompt", data.prompt);
      formData.append("mediaType", data.mediaType);
      formData.append("projectId", data.projectId);
      if (data.resolution) formData.append("resolution", data.resolution);
      if (data.aspectRatio) formData.append("aspectRatio", data.aspectRatio);

      data.referenceImages.forEach((file) => {
        formData.append("referenceImages", file);
      });
      body = formData;
    }

    return await fetch("/api/ai-media/generate", {
      method: "POST",
      body,
    });
  },
  async calculateCost(data: {
    resolution: Resolution;
  }): Promise<{ creditsCost: number }> {
    return await fetch("/api/ai-media/calculate-cost", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => res.json().then((data) => data.creditsCost));
  },
};
