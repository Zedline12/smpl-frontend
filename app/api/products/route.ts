import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

export async function GET() {
  return proxyToBackend("/products");
}

export async function POST(req: NextRequest) {
  return proxyToBackend("/products", {
    method: "POST",
    body: await req.text(),
  });
}
