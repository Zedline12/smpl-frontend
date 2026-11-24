"use client";
import { useState } from "react";
import {
  Check,
  CircleUserRound,
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MediaManagerDialog } from "@/features/generation/components/prompt/MediaManagerDialog";
import { cn } from "@/lib/utils";
import {
  useAvatarsQuery,
  useCreateAvatar,
  useDeleteAvatar,
} from "../../hooks/use-ads-library";
import { useAdsSelectionStore } from "../../stores/useAdsSelectionStore";
import type { Avatar } from "../../types";
import {
  EmptyState,
  LibraryPage,
  fieldClass,
  ghostButton,
  primaryButton,
} from "./LibraryPage";

/** A name plus one photo (uploaded or from the library). Also used by the admin page. */
export function AvatarDialog({
  open,
  title,
  description,
  saving,
  onSave,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  saving: boolean;
  onSave: (body: { name: string; imageUrl: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const valid = name.trim().length > 0 && !!imageUrl;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="tw-fields max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            aria-label={imageUrl ? "Change photo" : "Choose a photo"}
            className="hover:border-primary/50 relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-white/15 text-white/50 hover:text-white"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" decoding="async"
                src={imageUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              <ImagePlus className="size-6" />
            )}
          </button>
          <label className="flex flex-1 flex-col gap-1.5 text-sm text-white/70">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Maya"
              className={fieldClass}
            />
          </label>
        </div>
        <DialogFooter>
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid || saving}
            onClick={() => onSave({ name: name.trim(), imageUrl })}
            className={primaryButton}
          >
            {saving ? "Saving…" : "Add avatar"}
          </button>
        </DialogFooter>
        <MediaManagerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          selectedImage={imageUrl}
          onSelect={(urls) => setImageUrl(urls[0] ?? "")}
          maxSelections={1}
        />
      </DialogContent>
    </Dialog>
  );
}

function AvatarTile({
  avatar,
  used,
  onUse,
  onDelete,
}: {
  avatar: Avatar;
  used: boolean;
  onUse: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="group flex flex-col gap-2">
      <div
        className={cn(
          "relative aspect-[3/4] overflow-hidden rounded-2xl border-2 bg-black transition-colors",
          used ? "border-primary" : "border-transparent",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" decoding="async"
          src={avatar.imageUrl}
          alt={avatar.name}
          className="size-full object-cover"
        />
        {onDelete && (
          <button
            type="button"
            aria-label={`Delete ${avatar.name}`}
            onClick={onDelete}
            className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-lg bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/80 focus:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={onUse}
          aria-pressed={used}
          className={cn(
            "absolute inset-x-2 bottom-2 flex h-8 items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-opacity",
            used
              ? "bg-primary text-white"
              : "bg-white text-black opacity-0 group-hover:opacity-100 focus:opacity-100",
          )}
        >
          {used && <Check className="size-3.5" />}
          {used ? "In ad" : "Use in ad"}
        </button>
      </div>
      <span className="truncate px-0.5 text-sm font-medium text-white/85">
        {avatar.name}
      </span>
    </div>
  );
}

const GRID = "grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6";

/** Ads Studio → Avatars: our presets and the user's uploads. */
export function AvatarsWorkspace() {
  const { data: avatars = [], isFetched } = useAvatarsQuery();
  const { avatarId, setAvatarId } = useAdsSelectionStore();
  const create = useCreateAvatar();
  const remove = useDeleteAvatar();
  const [adding, setAdding] = useState<number | null>(null);
  const ours = avatars.filter((a) => a.isPreset);
  const mine = avatars.filter((a) => !a.isPreset);
  const use = (id: string) => setAvatarId(avatarId === id ? null : id);

  const uploadButton = (
    <button
      type="button"
      onClick={() => setAdding(Date.now())}
      className={primaryButton}
    >
      <Upload className="size-4" /> Upload avatar
    </button>
  );

  return (
    <LibraryPage
      title="Avatars"
      description="The person in your ads. Choose one of ours or upload your own photo."
      action={uploadButton}
    >
      {!isFetched ? (
        <div className={GRID}>
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-white/[0.05]"
            />
          ))}
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-white/70">My avatars</h2>
            {mine.length === 0 ? (
              <EmptyState
                icon={<CircleUserRound className="size-6" />}
                title="No avatars of your own yet"
                text="Upload a clear, front-facing photo of the person you want in your ads."
              />
            ) : (
              <div className={GRID}>
                {mine.map((a) => (
                  <AvatarTile
                    key={a.id}
                    avatar={a}
                    used={avatarId === a.id}
                    onUse={() => use(a.id)}
                    onDelete={() => {
                      if (avatarId === a.id) setAvatarId(null);
                      remove.mutate(a.id);
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {ours.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-white/70">
                Our avatars
              </h2>
              <div className={GRID}>
                {ours.map((a) => (
                  <AvatarTile
                    key={a.id}
                    avatar={a}
                    used={avatarId === a.id}
                    onUse={() => use(a.id)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {adding !== null && (
        <AvatarDialog
          key={adding}
          open
          title="Upload an avatar"
          description="A clear, well-lit, front-facing photo works best."
          saving={create.isPending}
          onSave={(body) =>
            create.mutate(body, { onSuccess: () => setAdding(null) })
          }
          onClose={() => setAdding(null)}
        />
      )}
    </LibraryPage>
  );
}
