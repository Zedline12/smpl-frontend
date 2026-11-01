import { fetchWithToken } from "@/lib/fetcher";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { ids, projectId } = await req.json();
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }
  const res = await fetchWithToken(
    `/projects/${encodeURIComponent(projectId)}/media`,
    {
      method: "POST",
      body: JSON.stringify({ ids }),
      headers: { "Content-Type": "application/json" },
    },
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message || "Could not move media" },
      { status: res.status },
    );
  }
  return NextResponse.json(data);
}
