import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/** Admin dashboard user statistics (needs the admin token, so it goes through the server). */
export async function GET() {
  try {
    const response = await fetchWithToken("/admin/users/statistics");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to fetch statistics" },
        { status: response.status },
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error fetching user statistics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
