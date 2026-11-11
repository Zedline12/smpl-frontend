import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** A signed URL for uploading one support screenshot. */
export async function POST(req: NextRequest) {
  return proxyToBackend("/support/attachments/signed-url", { method: "POST", body: await req.text() });
}
