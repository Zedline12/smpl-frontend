import { redirect } from "next/navigation";
import { VideoAnalyzerHome } from "@/features/video-analyzer/components/VideoAnalyzerHome";

export default async function VideoAnalyzerPage({
  searchParams,
}: {
  searchParams: Promise<{ analysis?: string }>;
}) {
  // Old links opened an analysis in a modal here; it has its own page now.
  const { analysis } = await searchParams;
  if (analysis) {
    redirect(`/video-analyzer/analyses/${encodeURIComponent(analysis)}`);
  }
  return <VideoAnalyzerHome />;
}
