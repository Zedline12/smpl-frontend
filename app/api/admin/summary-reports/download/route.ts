import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** The summary workbook for a date range, streamed through. */
export async function GET(req: NextRequest) {
  try {
    const response = await fetchWithToken(`/admin/summary-reports/download?${req.nextUrl.searchParams}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.message || "Couldn't build the report" }, { status: response.status });
    }
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": response.headers.get("Content-Disposition") ?? 'attachment; filename="smpl-summary.xlsx"',
      },
    });
  } catch (error) {
    unstable_rethrow(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
