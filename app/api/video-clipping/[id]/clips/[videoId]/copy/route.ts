import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Rewrites one clip's post copy. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; videoId: string }> },
) {
  const { id, videoId } = await params;
  return proxyToBackend(
    `/video-clipping/${encodeURIComponent(id)}/clips/${encodeURIComponent(videoId)}/copy`,
    { method: "POST" },
  );
}
