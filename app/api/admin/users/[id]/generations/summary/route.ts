import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { fetchWithToken } from "@/lib/fetcher";

/** What the user cost us, paid and earned us, overall and per model. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const res = await fetchWithToken(`/admin/users/${encodeURIComponent(id)}/generations/summary`);
    const json = await res.json().catch(() => null);
    if (!res.ok || !json) {
      return NextResponse.json(
        { message: json?.message ?? "Couldn't load the generation totals." },
        { status: res.ok ? 502 : res.status },
      );
    }
    return NextResponse.json(json.data ?? json);
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ message: "Couldn't load the generation totals." }, { status: 502 });
  }
}
