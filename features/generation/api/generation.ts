import {
  CalculateMediaCostRequest,
  CalculateMediaCostResponse,
} from "@/features/media/types/api";
import { GenerateImageRequest, GenerateRequest, GenerateVideoRequest } from "../types/api";
import { GenerationQueue } from "../types/generation";
export async function fetchGenerationCost(
  data: CalculateMediaCostRequest,
): Promise<CalculateMediaCostResponse> {
  const { model,input } = data;
  const res = await fetch("/api/generation/calculate-cost", {
    method: "POST",
    body: JSON.stringify({ model,input }),
  });
  const json = await res.json();
  return json.data as CalculateMediaCostResponse;
}
export async function fetchGenerationQueues(): Promise<GenerationQueue[] | []> {
  // if (!projectId) return [];
  const res = await fetch(`/api/media/me/queues`);
  const json = await res.json();
  return json.data;
}
export async function generate(data: GenerateRequest) {
  const res = await fetch("/api/generation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  return json.data;
}
export async function videoGeneration(data: GenerateRequest) {
  const res = await fetch("/api/ai-media/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  return json.data;
}
export async function imageGeneration(data: GenerateImageRequest) {
  const res = await fetch("/api/ai-media/generate/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  return json.data;
}
