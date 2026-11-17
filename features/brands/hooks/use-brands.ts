import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLiveStore } from "@/features/live/store";
import {
  createBrand,
  createBrandFromWebsite,
  deleteBrand,
  fetchBrand,
  fetchBrandQueues,
  fetchBrands,
  updateBrand,
} from "../api";
import { Brand, BrandInput, isActiveStatus } from "../types";

export const brandKeys = {
  all: ["brands"] as const,
  one: (id: string) => ["brands", id] as const,
  queues: ["brands", "queues"] as const,
};

/** Live updates replace polling; these intervals only run while the live stream is down. */
const offline = () => !useLiveStore.getState().connected;

export function useBrandsQuery() {
  return useQuery({
    queryKey: brandKeys.all,
    queryFn: fetchBrands,
    staleTime: 30_000,
    retry: 0,
    refetchInterval: (query) =>
      offline() && query.state.data?.some((b) => isActiveStatus(b.status))
        ? 5_000
        : false,
  });
}

/** One brand; polls while its website is being read. */
export function useBrandQuery(id: string | null) {
  return useQuery({
    queryKey: brandKeys.one(id ?? ""),
    queryFn: () => fetchBrand(id!),
    enabled: !!id,
    retry: 0,
    refetchInterval: (query) =>
      query.state.data && isActiveStatus(query.state.data.status)
        ? 2_000
        : false,
  });
}

/** Running extractions (kept so the live events invalidation has something to refresh). */
export function useBrandQueuesQuery() {
  return useQuery({
    queryKey: brandKeys.queues,
    queryFn: fetchBrandQueues,
    retry: 0,
    refetchInterval: (query) =>
      offline() && query.state.data?.some((j) => isActiveStatus(j.status))
        ? 1_000
        : false,
  });
}

/** Keeps the list and the single-brand cache in step after a change. */
function useStoreBrand() {
  const queryClient = useQueryClient();
  return (brand: Brand) => {
    queryClient.setQueryData<Brand[]>(brandKeys.all, (old) =>
      old?.some((b) => b.id === brand.id)
        ? old.map((b) => (b.id === brand.id ? brand : b))
        : [brand, ...(old ?? [])],
    );
    queryClient.setQueryData(brandKeys.one(brand.id), brand);
  };
}

export function useCreateBrandFromWebsite() {
  const store = useStoreBrand();
  return useMutation({
    mutationFn: (websiteUrl: string) => createBrandFromWebsite(websiteUrl),
    onSuccess: store,
    onError: (error) => toast.error(error.message),
  });
}

export function useCreateBrand() {
  const store = useStoreBrand();
  return useMutation({
    mutationFn: (body: BrandInput) => createBrand(body),
    onSuccess: (brand) => {
      store(brand);
      toast.success("Brand kit saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateBrand() {
  const store = useStoreBrand();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<BrandInput> }) =>
      updateBrand(id, body),
    onSuccess: (brand) => {
      store(brand);
      toast.success("Brand kit saved");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBrand(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Brand[]>(brandKeys.all, (old) =>
        old?.filter((b) => b.id !== id),
      );
      queryClient.removeQueries({ queryKey: brandKeys.one(id) });
    },
    onError: (error) => toast.error(error.message),
  });
}
