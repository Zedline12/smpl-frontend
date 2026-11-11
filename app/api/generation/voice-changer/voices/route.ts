import { proxyToBackend } from "@/lib/backend-proxy";

/** The voice changer's voices, with sample audio. */
export async function GET() {
  return proxyToBackend("/generation/voice-changer/voices");
}
