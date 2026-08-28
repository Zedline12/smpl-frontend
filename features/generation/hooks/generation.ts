import {
  editGeneration,
  fetchGenerationCost,
  fetchGenerationQueues,
  generate,
  refundGeneration,
} from "@/features/generation/api/generation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  EditGenerateRequest,
  GenerateRequest,
} from "@/features/generation/types/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useAiGenerationControlStore,
  useAiModelStore,
} from "@/stores/useAiGenerationControlStore";
export function useGenerateMutation() {
 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload:GenerateRequest) => generate(payload),
    onSuccess: (data) => {
      queryClient.refetchQueries({
        queryKey: ["generation-queues"],
      });
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}


export function useRefundGenerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (generationId: string) => refundGeneration(generationId),
    onSuccess: () => {
      toast.success("Generation refunded — your credits are back.");
      // The job leaves the queue and the balance changes.
      queryClient.refetchQueries({ queryKey: ["generation-queues"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useEditGenerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EditGenerateRequest) => editGeneration(payload),
    onSuccess: (data) => {
      queryClient.refetchQueries({ queryKey: ["generation-queues"] });
      return data;
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useGenerationCostQuery() {
  const { model } = useAiGenerationControlStore();
  const { states } = useAiModelStore();
  const state = states[model]!;
const { prompt, ...stateWithoutPrompt } = state;
  return useQuery({
    queryKey: ["generation-cost", model,stateWithoutPrompt],
    queryFn: () =>
      fetchGenerationCost({ model,input:state }),
    staleTime: 1000 * 60,
  });
}


export const useGenerationQueuesQuery = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["generation-queues"],
    queryFn: async () => {
      const newJobs = await fetchGenerationQueues();
      const previousJobs = (queryClient.getQueryData(["generation-queues"]) as any[]) || [];
      const jobsMap = new Map(previousJobs.map((j) => [j.id, j]));
      newJobs.forEach((j: any) => jobsMap.set(j.id, j));
      return Array.from(jobsMap.values());
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.some((item: any) => ["pending", "processing"].includes(item.status))
      ) {
        return 1000;
      }
      return false;
    },
  });
};
