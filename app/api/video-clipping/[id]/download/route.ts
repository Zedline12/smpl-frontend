import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Streams the backend's zip of the chosen clips straight through. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ids = req.nextUrl.searchParams.get("ids");
    const response = await fetchWithToken(
      `/video-clipping/${encodeURIComponent(id)}/download${ids ? `?ids=${encodeURIComponent(ids)}` : ""}`,
    );
    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null);
      return NextResponse.json(
        { error: data?.message || "Couldn't download these clips" },
        { status: response.status || 500 },
      );
    }
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          response.headers.get("content-disposition") ?? 'attachment; filename="clips.zip"',
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
