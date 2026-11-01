import { redirect } from "next/navigation";

/** Old detail links open the analysis in the analyzer page's modal instead. */
export default async function VideoAnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/video-analyzer?analysis=${encodeURIComponent(id)}`);
}
