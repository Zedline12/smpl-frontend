import { unstable_rethrow } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { fetchWithToken } from "@/lib/fetcher";

/**
 * Opens an invoice PDF. The backend answers with Stripe's PDF link (not the file),
 * so this redirects the browser there. Works for the user's own invoices and, for
 * admins, any user's.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ invoiceId: string }> }) {
  try {
    const { invoiceId } = await params;
    const response = await fetchWithToken("/payments/invoices/download", {
      method: "POST",
      body: JSON.stringify({ invoiceId }),
      headers: { "Content-Type": "application/json" },
    });
    // Not always JSON: while the backend restarts, the host answers with an HTML page.
    const json = await response.json().catch(() => null);
    const url: unknown = json?.data?.url ?? json?.url;

    if (!response.ok || typeof url !== "string" || !/^https:\/\//.test(url)) {
      return NextResponse.json(
        { error: json?.message || "Couldn't download this invoice" },
        { status: response.ok ? 502 : response.status },
      );
    }
    return NextResponse.redirect(url, 302);
  } catch (error) {
    unstable_rethrow(error);
    console.error("Error downloading invoice:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
