import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyToBackend("/admin/avatars");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/admin/avatars", {
    method: "POST",
    body: await req.text(),
  });
}
