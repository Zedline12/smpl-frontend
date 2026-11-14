import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/styles");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/styles", { method: "POST", body: await req.text() });
}
