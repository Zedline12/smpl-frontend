import { fetchWithToken } from "@/lib/fetcher";

interface Invoice {
  subscriptionName: string;
  month: string;
  date: string;
  amount: string;
  invoiceId: string;
}

async function getInvoices(): Promise<Invoice[]> {
  try {
    const res = await fetchWithToken("/users/invoices");
    const json = await res.json();
    return json?.data ?? [];
  } catch {
    return [];
  }
}

export default async function BillingPage() {
  const invoices = await getInvoices();

  return (
    <div className="max-w-2xl">
      <h2
        className="text-white font-semibold mb-6"
        style={{ fontSize: 18, letterSpacing: "-0.01em" }}
      >
        Billing &amp; Invoices
      </h2>

      {invoices.length === 0 ? (
        <div
          className="rounded-xl border px-6 py-10 text-center"
          style={{ borderColor: "rgba(255,255,255,0.07)", background: "oklch(0.13 0 0)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            No invoices yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.invoiceId}
              className="flex items-center justify-between rounded-xl border px-5 py-4 transition-colors duration-150"
              style={{
                borderColor: "rgba(255,255,255,0.07)",
                background: "oklch(0.13 0 0)",
              }}
            >
              {/* Left */}
              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {invoice.subscriptionName} — {invoice.month}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {invoice.date}
                </span>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  {invoice.amount}
                </span>
                <a
                  href={`/api/invoices/${invoice.invoiceId}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-150 hover:bg-white/10 hover:border-white/20"
                  style={{
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  title="Download invoice"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M12 3v13M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 21h14" strokeLinecap="round" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
