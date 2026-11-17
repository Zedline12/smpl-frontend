import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/** Create my brand: extract a brand kit from a website. */
export async function POST(req: NextRequest) {
  return proxyToBackend("/brands/from-website", {
    method: "POST",
    body: await req.text(),
  });
}
