import { AnalysisView } from "@/features/video-analyzer/components/AnalysisView";

export default async function VideoAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalysisView id={id} />;
}
