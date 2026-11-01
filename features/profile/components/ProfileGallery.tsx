"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Globe } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTogglePublishMutation } from "@/features/profile/hooks/use-profile";
import { Media, MediaType } from "@/features/media/types/media";

type Tab = "all" | "projects";

async function fetchOwnMedia({
  type,
  limit,
  offset,
}: {
  type?: MediaType;
  limit: number;
  offset: number;
}): Promise<{ data: Media[]; totalCount: number; limit: number }> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`/api/media/me?${params}`);
  const json = await res.json();
  return {
    data: json.data?.data ?? [],
    totalCount: json.data?.totalCount ?? 0,
    limit: json.data?.limit ?? limit,
  };
}

async function fetchPublishedMedia(
  userId: string,
  {
    type,
    limit,
    offset,
  }: { type?: MediaType; limit: number; offset: number },
): Promise<{ data: Media[]; totalCount: number; limit: number }> {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const res = await fetch(`/api/media/user/${userId}/published?${params}`);
  const json = await res.json();
  return {
    data: json.data ?? [],
    totalCount: json.total ?? 0,
    limit,
  };
}

function MediaTile({ media, isOwn }: { media: Media; isOwn: boolean }) {
  const { mutate: togglePublish, isPending } = useTogglePublishMutation();
  const isVideo = media.type === "video";

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900">
      {isVideo ? (
        <video
          src={media.url}
          className="h-full w-full object-cover"
          muted
          loop
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => (e.currentTarget as HTMLVideoElement).pause()}
        />
      ) : (
        <Image src={media.url} alt="" fill className="object-cover" />
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
        {isOwn && (
          <div className="flex items-center justify-between p-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                media.isPublished
                  ? "bg-green-500/20 text-green-400"
                  : "bg-neutral-700 text-neutral-400"
              }`}
            >
              {media.isPublished ? "Published" : "Private"}
            </span>
            <button
              onClick={() =>
                togglePublish({ id: media.id, isPublished: !media.isPublished })
              }
              disabled={isPending}
              className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50"
            >
              {media.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        )}
      </div>

      {isOwn && media.isPublished && (
        <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-400" />
      )}
    </div>
  );
}

interface ProfileGalleryProps {
  isOwn: boolean;
  profileId: string;
}

export default function ProfileGallery({ isOwn, profileId }: ProfileGalleryProps) {
  const [tab, setTab] = useState<Tab>("all");
  const LIMIT = 12;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: isOwn
        ? ["media", "profile-own"]
        : ["media", "profile-published", profileId],
      queryFn: ({ pageParam = 0 }) =>
        isOwn
          ? fetchOwnMedia({ limit: LIMIT, offset: pageParam as number })
          : fetchPublishedMedia(profileId, {
              limit: LIMIT,
              offset: pageParam as number,
            }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const loaded = allPages.flatMap((p) => p.data).length;
        return loaded < lastPage.totalCount ? loaded : undefined;
      },
      staleTime: 30_000,
    });

  const allMedia = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="flex flex-1 flex-col gap-4 min-w-0">
      {/* Nav row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-neutral-900 p-1">
          {(["all", "projects"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {t === "all" ? "All Works" : "Projects"}
            </button>
          ))}
        </div>

        {isOwn && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-neutral-800 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700">
              <Globe size={14} />
              Publish
            </button>
            <Link
              href="/create"
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-black transition hover:bg-neutral-200"
            >
              <Plus size={14} />
              Create
            </Link>
          </div>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-neutral-800"
            />
          ))}
        </div>
      ) : allMedia.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-neutral-500">
          <p className="text-sm">No works yet</p>
          {isOwn && (
            <Link
              href="/create"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:bg-neutral-200"
            >
              Create your first work
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {allMedia.map((media) => (
              <MediaTile key={media.id} media={media} isOwn={isOwn} />
            ))}
          </div>
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mx-auto mt-4 rounded-xl border border-white/10 px-6 py-2 text-sm text-neutral-400 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
