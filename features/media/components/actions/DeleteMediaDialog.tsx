"use client";
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
import { useDeleteMediaMutation } from "../../hooks/useMediaActions";

interface DeleteMediaDialogProps {
  ids: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteMediaDialog({
  ids,
  open,
  onOpenChange,
  onDeleted,
}: DeleteMediaDialogProps) {
  const deleteMedia = useDeleteMediaMutation();
  const many = ids.length > 1;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {many ? `Delete ${ids.length} items?` : "Delete this item?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {many ? "They'll be removed" : "It'll be removed"} from your
            creations and projects. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            disabled={deleteMedia.isPending}
            onClick={() =>
              deleteMedia.mutate(ids, {
                onSuccess: () => {
                  onOpenChange(false);
                  onDeleted?.();
                },
              })
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
