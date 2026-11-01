"use client";

import { use } from "react";
import { useProfileQuery } from "@/features/profile/hooks/use-profile";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import ProfileSidebar from "@/features/profile/components/ProfileSidebar";
import ProfileGallery from "@/features/profile/components/ProfileGallery";

interface Props {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: Props) {
  const { username } = use(params);
  const { user } = useCurrentUser();
  const { data: profile, isLoading, isError } = useProfileQuery(username);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-400">
        Profile not found.
      </div>
    );
  }

  const isOwn = !!user && user.username === profile.username;

  return (
    <div className="flex h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl gap-10 px-6 py-10">
        <ProfileSidebar profile={profile} isOwn={isOwn} />
        <ProfileGallery isOwn={isOwn} profileId={profile.id} />
      </div>
    </div>
  );
}
