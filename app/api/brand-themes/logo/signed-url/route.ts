import { NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST() {
  try {
    const response = await fetchWithToken("/brand-themes/logo/signed-url", {
      method: "POST",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to get an upload URL" },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting logo signed URL:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
