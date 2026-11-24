import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyToBackend("/me/legal/rights");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/me/legal/rights", { method: "POST", body: await req.text() });
}
