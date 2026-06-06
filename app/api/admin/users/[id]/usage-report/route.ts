import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const response = await fetchWithToken(`/admin/users/${id}/usage-report`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to generate usage report" },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("Content-Type") ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const contentDisposition = response.headers.get("Content-Disposition") ?? `attachment; filename="usage-report-${id}.xlsx"`;

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
      },
    });
  } catch (error) {
    console.error("Error downloading usage report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
