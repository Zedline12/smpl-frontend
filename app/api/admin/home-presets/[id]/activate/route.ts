import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

type Ctx = { params: Promise<{ id: string }> };

/** Makes the preset the live home page. */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return proxyToBackend(`/admin/home-presets/${encodeURIComponent(id)}/activate`, { method: "POST" });
}
