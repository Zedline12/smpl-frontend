import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** A user's activity log for the admin user page (`?page&limit&action`). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const query = new URLSearchParams();
  for (const key of ["page", "limit", "action"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  try {
    const res = await fetchWithToken(`/admin/user-activity/${encodeURIComponent(id)}?${query}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: json?.message ?? "Couldn't load the activity." },
        { status: res.ok ? 502 : res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't load the activity." }, { status: 502 });
  }
}
