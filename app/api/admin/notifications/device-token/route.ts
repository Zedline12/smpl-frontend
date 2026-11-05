import { NextRequest, NextResponse } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

async function readToken(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return typeof body?.token === "string" ? body.token : "";
}

export async function POST(req: NextRequest) {
  const token = await readToken(req);
  if (!token) return NextResponse.json({ error: "token is required" }, { status: 400 });
  return proxyToBackend("/admin/notifications/device-token", {
    method: "POST",
    headers: { "User-Agent": req.headers.get("user-agent") ?? "" },
    body: JSON.stringify({ token }),
  });
}

export async function DELETE(req: NextRequest) {
  const token = await readToken(req);
  return proxyToBackend("/admin/notifications/device-token", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}
