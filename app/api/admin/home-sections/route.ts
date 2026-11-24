import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** App Appearance → Homepage: a preset's sections (`presetId`; the live preset without it). */
export async function GET(req: NextRequest) {
  const presetId = req.nextUrl.searchParams.get("presetId");
  return proxyToBackend(`/admin/home-sections${presetId ? `?presetId=${encodeURIComponent(presetId)}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/home-sections", { method: "POST", body: await req.text() });
}
