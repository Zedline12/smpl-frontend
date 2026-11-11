import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Adds clips to the user's media library. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyToBackend(`/video-clipping/${encodeURIComponent(id)}/clips/save`, {
    method: "POST",
    body: await req.text(),
  });
}
