import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyToBackend("/avatars");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/avatars", { method: "POST", body: await req.text() });
}
