import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPrompt, deletePrompt, fetchPrompts } from "../api/prompt-maker";
import { CreatePromptMakerRequest, PromptMaker } from "../types/prompt-maker";

export const promptMakerKeys = {
  all: ["prompt-maker"] as const,
};

export function usePromptsQuery() {
  return useQuery({
    queryKey: promptMakerKeys.all,
    queryFn: fetchPrompts,
    staleTime: 60_000,
    retry: 0,
  });
}

export function useCreatePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePromptMakerRequest) => createPrompt(body),
    onSuccess: (prompt) => {
      queryClient.setQueryData<PromptMaker[]>(promptMakerKeys.all, (old) =>
        old ? [prompt, ...old] : [prompt],
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeletePromptMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrompt(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<PromptMaker[]>(promptMakerKeys.all, (old) =>
        old ? old.filter((prompt) => prompt.id !== id) : old,
      );
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
