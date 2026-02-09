import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMyProjects, fetchProject, updateProject } from "@/features/projects/api/projects";
import { UpdateProjectRequest } from "../types/api";

export function useProjectsQuery() {
  return useQuery({
    queryKey: ["projects", "me"],
    queryFn: fetchMyProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
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