"use client";

import { CreateVideoAnalysisForm } from "@/features/video-analyzer/components/CreateVideoAnalysisForm";
import { useCreateVideoAnalysisMutation } from "@/features/video-analyzer/hooks/use-video-analyzer";

export default function VideoAnalyzerPage() {
  const createAnalysis = useCreateVideoAnalysisMutation();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <header>
        <h1 className="text-foreground text-2xl font-bold">Video Analyzer</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paste a YouTube link and get a scene-by-scene breakdown: what&apos;s on
          screen, what&apos;s said, and any on-screen text.
        </p>
      </header>

      <CreateVideoAnalysisForm
        onSubmit={(values) => createAnalysis.mutate(values)}
        isSubmitting={createAnalysis.isPending}
      />
    </div>
  );
}
