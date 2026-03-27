import { apiFetch } from "@/lib/api/client";
import { Media, Project } from "@/lib/types/project.type";

export const projectsService = {
  async getProjects(): Promise<Project[]> {
    return await apiFetch("projects/me", {
      method: "GET",
    });
  },
  async createProject(name: string): Promise<Project> {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    return json.data;
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
