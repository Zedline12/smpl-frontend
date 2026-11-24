"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AvatarDialog } from "@/features/ads-studio/components/library/AvatarsWorkspace";
import {
  useAdminAvatarsQuery,
  useCreateAdminAvatar,
  useDeleteAdminAvatar,
  useReorderAdminAvatars,
  useUpdateAdminAvatar,
} from "@/features/ads-studio/hooks/use-ads-library";
import type { AdminAvatar } from "@/features/ads-studio/types";
import { cn } from "@/lib/utils";

const iconButton =
  "flex size-7 items-center justify-center rounded-md text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-25";

/** App Appearance → Avatars: the preset avatars users can pick in Ads Studio. */
export function AvatarsEditor() {
  const { data: avatars = [], isFetched } = useAdminAvatarsQuery();
  const create = useCreateAdminAvatar();
  const update = useUpdateAdminAvatar();
  const remove = useDeleteAdminAvatar();
  const reorder = useReorderAdminAvatars();
  const [adding, setAdding] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<AdminAvatar | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  const move = (index: number, dir: -1 | 1) => {
    const ids = avatars.map((a) => a.id);
    [ids[index], ids[index + dir]] = [ids[index + dir], ids[index]];
    reorder.mutate(ids);
  };

  const saveName = (avatar: AdminAvatar) => {
    const name = names[avatar.id]?.trim();
    if (!name || name === avatar.name) return;
    update.mutate({ id: avatar.id, body: { name } });
  };

  return (
    <div className="flex max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Avatars</h1>
          <p className="text-sm text-white/50">
            The &quot;Our avatars&quot; users can pick in Ads Studio. Hidden
            ones stay out of the list.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(Date.now())}
          className="bg-primary hover:bg-primary/90 flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white"
        >
          <Plus className="size-4" /> Add avatar
        </button>
      </header>

      {!isFetched ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : avatars.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-white/50">
          No preset avatars yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {avatars.map((avatar, i) => (
            <div
              key={avatar.id}
              className={cn(
                "flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2",
                !avatar.isActive && "opacity-50",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async"
                src={avatar.imageUrl}
                alt={avatar.name}
                className="aspect-[3/4] w-full rounded-lg object-cover"
              />
              <input
                value={names[avatar.id] ?? avatar.name}
                onChange={(e) =>
                  setNames((n) => ({ ...n, [avatar.id]: e.target.value }))
                }
                onBlur={() => saveName(avatar)}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                maxLength={80}
                aria-label="Avatar name"
                className="h-8 rounded-md border border-white/10 bg-black/30 px-2 text-sm text-white outline-none focus:border-white/30"
              />
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Move left"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className={iconButton}
                >
                  <ArrowLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Move right"
                  disabled={i === avatars.length - 1}
                  onClick={() => move(i, 1)}
                  className={iconButton}
                >
                  <ArrowRight className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={avatar.isActive ? "Hide" : "Show"}
                  title={
                    avatar.isActive ? "Shown to users" : "Hidden from users"
                  }
                  onClick={() =>
                    update.mutate({
                      id: avatar.id,
                      body: { isActive: !avatar.isActive },
                    })
                  }
                  className={cn(iconButton, "ml-auto")}
                >
                  {avatar.isActive ? (
                    <Eye className="size-3.5" />
                  ) : (
                    <EyeOff className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => setDeleting(avatar)}
                  className={cn(iconButton, "hover:text-red-400")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding !== null && (
        <AvatarDialog
          key={adding}
          open
          title="Add a preset avatar"
          description="Shown to every user under “Our avatars” in Ads Studio."
          saving={create.isPending}
          onSave={(body) =>
            create.mutate(body, { onSuccess: () => setAdding(null) })
          }
          onClose={() => setAdding(null)}
        />
      )}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              It disappears from every user&apos;s avatar list. To keep it but
              stop showing it, hide it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
