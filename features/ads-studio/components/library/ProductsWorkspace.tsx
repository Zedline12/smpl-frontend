"use client";
import { useState } from "react";
import {
  Check,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
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
  useCreateProduct,
  useDeleteProduct,
  useProductsQuery,
  useUpdateProduct,
} from "../../hooks/use-ads-library";
import { useAdsSelectionStore } from "../../stores/useAdsSelectionStore";
import { PRODUCT_MAX_IMAGES, Product } from "../../types";
import {
  EmptyState,
  LibraryPage,
  fieldClass,
  ghostButton,
  primaryButton,
} from "./LibraryPage";

/** Add or edit a product: name, optional description, and its photos (upload or library). */
function ProductDialog({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const saving = create.isPending || update.isPending;
  const valid = name.trim().length > 0 && images.length > 0;

  const save = () => {
    if (!valid) return;
    const body = { name: name.trim(), description: description.trim(), images };
    const done = { onSuccess: onClose };
    if (product) update.mutate({ id: product.id, body }, done);
    else create.mutate(body, done);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="tw-fields max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit product" : "Add a product"}
          </DialogTitle>
          <DialogDescription>
            Clear photos of the product work best: front, packaging, label.
            They&apos;re sent to the ads model as references.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="e.g. Iced cold brew"
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-white/70">
            Description{" "}
            <span className="-mt-1 text-xs text-white/35">Optional</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={2}
              placeholder="What it is, what makes it special"
              className={cn(fieldClass, "h-auto resize-none py-2")}
            />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-white/70">
              Photos ({images.length}/{PRODUCT_MAX_IMAGES})
            </span>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <span
                  key={url}
                  className="group relative size-20 overflow-hidden rounded-xl border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    aria-label="Remove photo"
                    onClick={() => setImages(images.filter((u) => u !== url))}
                    className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {images.length < PRODUCT_MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="hover:border-primary/50 flex size-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-white/15 text-xs text-white/50 transition-colors hover:text-white"
                >
                  <ImagePlus className="size-5" />
                  Add
                </button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <button type="button" onClick={onClose} className={ghostButton}>
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!valid || saving}
            className={primaryButton}
          >
            {saving ? "Saving…" : product ? "Save" : "Add product"}
          </button>
        </DialogFooter>

        <MediaManagerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          selectedImages={images}
          onSelect={(urls) => setImages(urls.slice(0, PRODUCT_MAX_IMAGES))}
          maxSelections={PRODUCT_MAX_IMAGES}
        />
      </DialogContent>
    </Dialog>
  );
}

/** Ads Studio → Products. */
export function ProductsWorkspace() {
  const { data: products = [], isFetched } = useProductsQuery();
  const { productIds, toggleProduct } = useAdsSelectionStore();
  const remove = useDeleteProduct();
  // `key` remounts the dialog so it starts from the product being edited.
  const [editing, setEditing] = useState<{
    key: number;
    product: Product | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const openNew = () => setEditing({ key: Date.now(), product: null });

  const addButton = (
    <button type="button" onClick={openNew} className={primaryButton}>
      <Plus className="size-4" /> Add product
    </button>
  );

  return (
    <LibraryPage
      title="Products"
      description="Your products and their photos. Pick them in the composer and they'll appear in your ads."
      action={products.length > 0 ? addButton : undefined}
    >
      {!isFetched ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-white/[0.05]"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="size-6" />}
          title="No products yet"
          text="Upload photos of what you sell, or pick them from your library."
          action={addButton}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const used = productIds.includes(product.id);
            return (
              <div
                key={product.id}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-2xl border bg-white/[0.03] transition-colors",
                  used ? "border-primary/60" : "border-white/[0.07]",
                )}
              >
                <div className="relative aspect-square bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="size-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] text-white">
                      +{product.images.length - 1}
                    </span>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      aria-label={`Edit ${product.name}`}
                      onClick={() => setEditing({ key: Date.now(), product })}
                      className="flex size-8 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-black/90"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => setDeleting(product)}
                      className="flex size-8 items-center justify-center rounded-lg bg-black/70 text-white hover:bg-red-500/80"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                    {product.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleProduct(product.id)}
                    aria-pressed={used}
                    className={cn(
                      "flex h-7 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition-colors",
                      used
                        ? "bg-primary text-white"
                        : "bg-white/[0.07] text-white/75 hover:text-white",
                    )}
                  >
                    {used && <Check className="size-3.5" />}
                    {used ? "In ad" : "Use in ad"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <ProductDialog
          key={editing.key}
          open
          product={editing.product}
          onClose={() => setEditing(null)}
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
              Ads you already made with it stay in All media.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleting) return;
                if (productIds.includes(deleting.id))
                  toggleProduct(deleting.id);
                remove.mutate(deleting.id);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LibraryPage>
  );
}
