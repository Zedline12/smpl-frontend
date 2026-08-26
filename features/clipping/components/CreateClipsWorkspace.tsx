"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateClippingProjectMutation } from "../hooks/use-clipping";
import { CreateClippingForm } from "./CreateClippingForm";

export function CreateClipsWorkspace() {
  const router = useRouter();
  const createProject = useCreateClippingProjectMutation();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Create</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Turn a long video into short clips ready for social.
        </p>
      </header>

      <CreateClippingForm
        onSubmit={(values) =>
          createProject.mutate(values, {
            onSuccess: () => {
              toast.success("Clipping started");
              router.push("/clipping-studio/your-clips");
            },
          })
        }
        isSubmitting={createProject.isPending}
      />
    </div>
  );
}
