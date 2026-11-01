import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyProjects, fetchProject, updateProject } from "@/features/projects/api/projects";
import { UpdateProjectRequest } from "../types/api";
import { projectsService } from "@/lib/api/services/projects.service";

export function useProjectsQuery() {
  return useQuery({
    queryKey: ["projects", "me"],
    queryFn: fetchMyProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const project = await projectsService.createProject(name);
      if (!project?.id) throw new Error("Could not create the project");
      return project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; body: UpdateProjectRequest }) =>
      updateProject(data.id, data.body),
      onSuccess: (_data, variables) => {
      queryClient.refetchQueries({queryKey:["projects", variables.id]});
    },
  });
}
export function useProjectQuery(projectId:string) {
    return useQuery({
      queryKey: ["projects", projectId],
      queryFn: ()=>fetchProject(projectId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
}