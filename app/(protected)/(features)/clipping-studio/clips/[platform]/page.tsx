import { notFound } from "next/navigation";
import { MyClips } from "@/features/clipping/components/MyClips";
import { PLATFORM_BY_SLUG } from "@/features/clipping/platforms";

export default async function PlatformClipsPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const match = PLATFORM_BY_SLUG[platform];
  if (!match) notFound();
  return <MyClips key={match.id} platform={match.id} />;
}
