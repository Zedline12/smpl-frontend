import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAdminAvatar,
  createAvatar,
  createProduct,
  deleteAdminAvatar,
  deleteAvatar,
  deleteProduct,
  fetchAdminAvatars,
  fetchAvatars,
  fetchProducts,
  reorderAdminAvatars,
  updateAdminAvatar,
  updateProduct,
} from "../api";
import { AvatarInput, ProductInput } from "../types";

export const adsLibraryKeys = {
  products: ["ads-studio", "products"] as const,
  avatars: ["ads-studio", "avatars"] as const,
  adminAvatars: ["admin", "avatars"] as const,
};

const onError = (error: Error) => toast.error(error.message);

/** Invalidates `key` after a successful mutation and reports failures as toasts. */
function useLibraryMutation<A>(
  key: readonly string[],
  fn: (arg: A) => Promise<unknown>,
  success?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      if (success) toast.success(success);
    },
    onError,
  });
}

// Products
export const useProductsQuery = () =>
  useQuery({
    queryKey: adsLibraryKeys.products,
    queryFn: fetchProducts,
    staleTime: 30_000,
  });
export const useCreateProduct = () =>
  useLibraryMutation(
    adsLibraryKeys.products,
    (body: ProductInput) => createProduct(body),
    "Product saved",
  );
export const useUpdateProduct = () =>
  useLibraryMutation(
    adsLibraryKeys.products,
    ({ id, body }: { id: string; body: Partial<ProductInput> }) =>
      updateProduct(id, body),
    "Product saved",
  );
export const useDeleteProduct = () =>
  useLibraryMutation(adsLibraryKeys.products, (id: string) =>
    deleteProduct(id),
  );

// Avatars
export const useAvatarsQuery = () =>
  useQuery({
    queryKey: adsLibraryKeys.avatars,
    queryFn: fetchAvatars,
    staleTime: 60_000,
  });
export const useCreateAvatar = () =>
  useLibraryMutation(
    adsLibraryKeys.avatars,
    (body: AvatarInput) => createAvatar(body),
    "Avatar added",
  );
export const useDeleteAvatar = () =>
  useLibraryMutation(adsLibraryKeys.avatars, (id: string) => deleteAvatar(id));

// Admin presets
export const useAdminAvatarsQuery = () =>
  useQuery({
    queryKey: adsLibraryKeys.adminAvatars,
    queryFn: fetchAdminAvatars,
  });
export const useCreateAdminAvatar = () =>
  useLibraryMutation(
    adsLibraryKeys.adminAvatars,
    (body: AvatarInput) => createAdminAvatar(body),
    "Avatar added",
  );
export const useUpdateAdminAvatar = () =>
  useLibraryMutation(
    adsLibraryKeys.adminAvatars,
    ({
      id,
      body,
    }: {
      id: string;
      body: Partial<AvatarInput & { isActive: boolean }>;
    }) => updateAdminAvatar(id, body),
  );
export const useDeleteAdminAvatar = () =>
  useLibraryMutation(adsLibraryKeys.adminAvatars, (id: string) =>
    deleteAdminAvatar(id),
  );
export const useReorderAdminAvatars = () =>
  useLibraryMutation(adsLibraryKeys.adminAvatars, (ids: string[]) =>
    reorderAdminAvatars(ids),
  );
