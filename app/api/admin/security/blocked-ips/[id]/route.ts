import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await fetchWithToken(
      `/admin/users/security/blocked-ips/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || "Failed" }, { status: response.status });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
