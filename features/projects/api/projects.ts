import { UpdateProjectRequest } from "../types/api";
import { Project, ProjectWithStatsAndMedia } from "../types/project";

export async function fetchMyProjects(): Promise<Project[] | []> {
  const res = await fetch("/api/projects/me");
  const json = await res.json();
  return json.data;
}
export async function updateProject(projectId: string,body:UpdateProjectRequest):Promise<Project | null> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json.data;
}
export async function fetchProject(projectId:string) :Promise<ProjectWithStatsAndMedia | null>{
    const res = await fetch(`/api/projects/${projectId}?include=stats,media`);
    const json = await res.json();
    return json.data;
}