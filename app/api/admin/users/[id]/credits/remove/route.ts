import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const response = await fetchWithToken(`/admin/users/${id}/credits/remove`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Failed to remove credits" },
        { status: response.status },
      );
    }

    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error removing credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
