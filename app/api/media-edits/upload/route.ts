import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

// The backend trims / crops with ffmpeg before answering; give it time.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  return proxyToBackend("/media-edits/upload", { method: "POST", body: await req.text() });
}
