"use client";

import { useRouter } from "next/navigation";
import { CreateVideoAnalysisForm } from "@/features/video-analyzer/components/CreateVideoAnalysisForm";
import { useCreateVideoAnalysisMutation } from "@/features/video-analyzer/hooks/use-video-analyzer";

export default function VideoAnalyzerPage() {
  const router = useRouter();
  const createAnalysis = useCreateVideoAnalysisMutation();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Video Analyzer</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload a video and get back ready-to-use prompts to recreate it,
          scene by scene.
        </p>
      </header>

      <CreateVideoAnalysisForm
        onSubmit={(values) =>
          createAnalysis.mutate(values, {
            onSuccess: () => router.push("/video-analyzer/analyses"),
          })
        }
        isSubmitting={createAnalysis.isPending}
      />
    </div>
  );
}
