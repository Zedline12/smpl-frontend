import { NextRequest, NextResponse } from "next/server";

/** Forwards the file itself (to read its embedded AI marker); up to 30 MB. */
export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  if (body.byteLength > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "Files up to 30 MB" }, { status: 413 });
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-check/file`, {
    method: "POST",
    headers: { "Content-Type": req.headers.get("content-type") ?? "application/octet-stream" },
    body,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
