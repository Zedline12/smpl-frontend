import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const id = (await params).id;
    const body = await req.json();
    console.log(body);
    const response = await fetchWithToken(`/subscription-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.message || "Failed to update subscription plan" },
        { status: response.status },
      );
    }

    const data = await response.json().catch(() => null);
    return NextResponse.json(data || { success: true });
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
