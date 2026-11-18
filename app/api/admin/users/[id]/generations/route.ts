import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** A user's generations with credits and USD cost / paid / profit (`?offset&limit`). */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const query = new URLSearchParams();
  for (const key of ["offset", "limit"]) {
    const value = req.nextUrl.searchParams.get(key);
    if (value) query.set(key, value);
  }
  try {
    const res = await fetchWithToken(`/admin/users/${encodeURIComponent(id)}/generations?${query}`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: json?.message ?? "Couldn't load the generations." },
        { status: res.ok ? 502 : res.status },
      );
    }
    // The backend wraps responses as { success, data }.
    return NextResponse.json(json.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't load the generations." }, { status: 502 });
  }
}
