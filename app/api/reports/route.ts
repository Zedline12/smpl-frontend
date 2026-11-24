import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Public: anyone can report content (signed in or not). */
export async function POST(req: NextRequest) {
  return proxyToBackend("/reports", { method: "POST", body: await req.text() });
}
