"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useUpdateProfileMutation } from "@/features/profile/hooks/use-profile";
import { UserProfile } from "@/lib/types/user.type";

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function EditProfileModal({
  profile,
  onClose,
}: EditProfileModalProps) {
  const [bio, setBio] = useState(profile.bio ?? "");
  const [instagram, setInstagram] = useState(
    profile.socialLinks?.instagram ?? "",
  );
  const [pinterest, setPinterest] = useState(
    profile.socialLinks?.pinterest ?? "",
  );
  const [facebook, setFacebook] = useState(profile.socialLinks?.facebook ?? "");
  const [x, setX] = useState(profile.socialLinks?.x ?? "");

  const { mutate, isPending } = useUpdateProfileMutation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      {
        bio: bio.trim() || undefined,
        socialLinks: {
          instagram: instagram.trim() || undefined,
          pinterest: pinterest.trim() || undefined,
          facebook: facebook.trim() || undefined,
          x: x.trim() || undefined,
        },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="mb-5 text-lg font-semibold text-white">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20"
              placeholder="Tell the world about yourself…"
            />
          </div>

          {(
            [
              { label: "Instagram", value: instagram, set: setInstagram, icon: "instagram.com/" },
              { label: "Pinterest", value: pinterest, set: setPinterest, icon: "pinterest.com/" },
              { label: "Facebook", value: facebook, set: setFacebook, icon: "facebook.com/" },
              { label: "X (Twitter)", value: x, set: setX, icon: "x.com/" },
            ] as const
          ).map(({ label, value, set, icon }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-400">
                {label}
              </label>
              <div className="flex items-center rounded-xl border border-white/10 bg-neutral-800 px-3">
                <span className="mr-1 text-xs text-neutral-500">{icon}</span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => (set as (v: string) => void)(e.target.value)}
                  className="flex-1 bg-transparent py-2 text-sm text-white placeholder-neutral-500 focus:outline-none"
                  placeholder="username"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="mt-1 rounded-xl bg-white py-2 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
