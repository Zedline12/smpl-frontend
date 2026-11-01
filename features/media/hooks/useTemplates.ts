import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GenerateRequest } from "@/features/generation/types/api";

export function useGenerateTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<GenerateRequest, "projectId">) => {
      const res = await fetch("/api/admin/templates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Could not create the template");
      return json;
    },
    onSuccess: () => {
      toast.success("Template is generating");
      queryClient.refetchQueries({ queryKey: ["generation-queues"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteTemplateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Could not delete the template");
      }
    },
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
