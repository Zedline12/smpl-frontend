import { apiFetch } from "@/lib/api/client";
import { Media, Project } from "@/lib/types/project.type";

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    return await apiFetch("projects/me", {
      method: "GET",
    });
  },
  async createProject(name: string): Promise<Project> {
    return await apiFetch("projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
  async getProject(id: string): Promise<Project & { media: Media[] }> {
    return await apiFetch(`projects/${id}?include=media`, {
      method: "GET",
    });
  },
  async getLatestGenerations(): Promise<Media[]> {
    return await apiFetch("projects/me/latest-generations", {
      method: "GET",
    });
  },
};
