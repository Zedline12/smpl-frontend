import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserProfile } from "@/lib/types/user.type";

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || "Request failed");
  return json;
}

export function useProfileQuery(username: string | undefined) {
  return useQuery<UserProfile>({
    queryKey: ["profile", username],
    queryFn: () => fetchJson(`/api/users/profile/${username}`),
    enabled: !!username,
    staleTime: 30_000,
  });
}

export function useFollowMutation(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ follow }: { follow: boolean }) =>
      fetchJson(`/api/users/${userId}/follow`, {
        method: follow ? "POST" : "DELETE",
      }),
    onMutate: ({ follow }) => {
      queryClient.setQueriesData<UserProfile>(
        { queryKey: ["profile"] },
        (old) =>
          old
            ? {
                ...old,
                isFollowing: follow,
                followersCount: old.followersCount + (follow ? 1 : -1),
              }
            : old,
      );
    },
    onError: (error) => {
      toast.error(error.message);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      bio?: string;
      socialLinks?: {
        instagram?: string;
        pinterest?: string;
        facebook?: string;
        x?: string;
      };
    }) =>
      fetchJson("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useTogglePublishMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      fetchJson(`/api/media/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => toast.error(error.message),
  });
}
