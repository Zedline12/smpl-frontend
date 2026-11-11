import { fetchWithToken } from "@/lib/fetcher";
import {
  CancelPlanCard,
  ManageBillingButton,
  MonthlyCreditsCard,
  PlanCard,
} from "./_components/CurrentPlanCard";
import { Building2, CreditCard, Receipt } from "lucide-react";
import { CreditPacksCard } from "@/features/credit-packs/components/CreditPacksCard";
import {
  EmptyState,
  SettingsHeader,
  SettingsPanel,
  SettingsTile,
} from "../_components/SettingsUi";

interface Invoice {
  subscriptionName: string;
  month: string;
  date: string;
  amount: string;
  invoiceId: string;
  /** Coupon savings on this invoice (cents) and the code used. */
  discountAmount?: number;
  couponCode?: string | null;
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

/** A card with one line of text and a Manage button that opens Stripe. */
function ManageCard({
  icon,
  title,
  text,
}: {
  icon: typeof CreditCard;
  title: string;
  text: string;
}) {
  return (
    <SettingsPanel icon={icon} title={title}>
      <SettingsTile className="flex items-center justify-between gap-4">
        <p className="text-sm text-white/60">{text}</p>
        <ManageBillingButton />
      </SettingsTile>
    </SettingsPanel>
  );
}

export default async function SubscriptionPage() {
  const invoices = await getInvoices();

  return (
    <div className="flex flex-col gap-5">
      <SettingsHeader title="Subscription" subtitle="Your plan, credits and billing details" />
      {/* Client islands: they need the auth context and react-query. */}
      <PlanCard />
      <MonthlyCreditsCard />
      <CreditPacksCard />
      <ManageCard
        icon={CreditCard}
        title="Payment methods"
        text="Add, remove or change the cards you pay with."
      />
      <ManageCard
        icon={Building2}
        title="Billing information"
        text="Update your billing name, address, email and tax details."
      />

      <SettingsPanel icon={Receipt} title="Invoices">
        {invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No invoices yet"
            text="Invoices will appear here after your first payment."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.invoiceId}
                className="flex items-center justify-between rounded-xl border px-5 py-4 transition-colors duration-150"
                style={{
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(255,255,255,0.045)",
                }}
              >
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
                    {!!invoice.discountAmount && (
                      <span className="ml-2 text-emerald-300/90">
                        −{`$${(invoice.discountAmount / 100).toFixed(2)}`}
                        {invoice.couponCode ? ` · ${invoice.couponCode}` : " discount"}
                      </span>
                    )}
                  </span>
                </div>

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
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="w-4 h-4"
                    >
                      <path
                        d="M12 3v13M7 11l5 5 5-5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M5 21h14" strokeLinecap="round" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </SettingsPanel>

      <CancelPlanCard />
    </div>
  );
}
