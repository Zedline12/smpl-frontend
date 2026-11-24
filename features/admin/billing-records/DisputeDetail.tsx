"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Copy, Download, FileText, Loader2, RefreshCw, Send, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { int } from "@/features/admin/components/data-viz/format";
import { cn } from "@/lib/utils";
import { DisputeRow, disputeStatusTone, DueIn, statusLabel } from "./DisputesDashboard";
import { Badge, billingApi, day, Facts, money, Section, StripeId, Timeline, TimelineEntry, UserLink, when } from "./shared";

/** The frozen evidence (see the backend's EvidenceSnapshot). */
interface Evidence {
  builtAt: string;
  customer: {
    email: string | null;
    name: string | null;
    signedUpAt: string | null;
    signupMethod: string | null;
    emailVerified: boolean | null;
    emailVerifiedAt: string | null;
    termsAcceptedAt: string | null;
    termsVersion: string | null;
    signupIp: string | null;
    signupCountry: string | null;
    lastIp: string | null;
    country: string | null;
    city: string | null;
    isVpn: boolean | null;
    isProxy: boolean | null;
    isDataCenter: boolean | null;
    accountAgeDays: number | null;
  };
  payment: {
    chargeId: string | null;
    amount: number;
    currency: string;
    paidAt: string | null;
    receiptUrl: string | null;
    billing: { name: string | null; email: string | null; phone: string | null; address: string | null };
    card: {
      brand: string | null;
      last4: string | null;
      expiry: string | null;
      country: string | null;
      funding: string | null;
      cvcCheck: string | null;
      addressLine1Check: string | null;
      postalCodeCheck: string | null;
      threeDSecure: string | null;
      wallet: string | null;
    };
    risk: { level: string | null; score: number | null; networkStatus: string | null; sellerMessage: string | null };
  };
  invoices: { date: string | null; amount: number; refunded: number; currency: string; status: string; usedAfter: { credits: number; generations: number } | null; invoiceUrl: string | null }[];
  activity: { at: string; action: string; method: string | null; ip: string | null; browser: string | null; os: string | null; device: string | null; location: string | null; vpn: boolean | null }[];
  access: { apiKeys: { name: string | null; lastUsedAt: string | null }[]; appConnections: { client: string | null; lastUsedAt: string | null }[] };
  usage: {
    totals: { generations: number; succeeded: number; creditsUsed: number; mediaCount: number; downloaded: number; firstAt: string | null; lastAt: string | null; activeDays: number };
    truncated: boolean;
  };
  communication: {
    emails?: { at: string | null; subject: string | null }[];
    tickets: { code: string | null; topic: string | null; status: string | null; openedAt: string | null; messages: { at: string | null; from: string; body: string }[] }[];
  };
  policies: { name: string; url: string; text: string | null }[];
}

interface DisputeDetailData extends DisputeRow {
  evidence: Evidence | null;
  stripeFileIds: Record<string, string>;
  timeline: TimelineEntry[];
  files: { name: string; label: string; forStripe: boolean }[];
  stripeText: Record<string, string | undefined> | null;
}

const TEXT_LABELS: Record<string, string> = {
  product_description: "Product description",
  customer_name: "Customer name",
  customer_email_address: "Customer email",
  billing_address: "Billing address",
  customer_purchase_ip: "Customer IP",
  service_date: "Service date",
  access_activity_log: "Access activity log",
  refund_policy_disclosure: "Refund policy disclosure",
  cancellation_policy_disclosure: "Cancellation policy disclosure",
  uncategorized_text: "Additional information",
};

const check = (v: string | null) =>
  v ? <span className={cn(v === "pass" || v === "authenticated" ? "text-emerald-300" : v === "fail" ? "text-red-300" : "text-white/70")}>{v}</span> : "—";

function CopyText({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-wide text-white/45 uppercase">{label}</p>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/60 hover:bg-white/5 hover:text-white"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-48 overflow-y-auto text-[12px] leading-relaxed whitespace-pre-wrap text-white/80">{value}</pre>
    </div>
  );
}

/** One dispute: what Stripe says, what we did, the evidence, downloads and the Stripe draft. */
export function DisputeDetail({ id }: { id: string }) {
  const qc = useQueryClient();
  const key = ["admin-dispute", id];
  const detail = useQuery({
    queryKey: key,
    queryFn: () => billingApi<DisputeDetailData>(`/disputes/${id}`),
    // The evidence is gathered in the background right after the dispute opens.
    refetchInterval: (q) => (q.state.data && !q.state.data.evidence && !q.state.data.evidenceError ? 4000 : false),
  });
  const d = detail.data;
  // null: not edited, so it shows the saved notes.
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const notes = notesDraft ?? d?.notes ?? "";

  const after = (data: DisputeDetailData) => {
    qc.setQueryData(key, data);
    void qc.invalidateQueries({ queryKey: ["admin-disputes"] });
  };
  const refresh = useMutation({
    mutationFn: () => billingApi<DisputeDetailData>(`/disputes/${id}/evidence/refresh`, { method: "POST" }),
    onSuccess: (data) => (after(data), toast.success("Evidence gathered again.")),
    onError: (e: Error) => toast.error(e.message),
  });
  const draft = useMutation({
    mutationFn: () => billingApi<DisputeDetailData>(`/disputes/${id}/stripe-draft`, { method: "POST" }),
    onSuccess: (data) => (after(data), toast.success("Sent to Stripe as a draft. Review and submit it in Stripe.")),
    onError: (e: Error) => toast.error(e.message),
  });
  const saveNotes = useMutation({
    mutationFn: () => billingApi<DisputeDetailData>(`/disputes/${id}`, { method: "PATCH", body: JSON.stringify({ notes }) }),
    onSuccess: (data) => (after(data), setNotesDraft(null), toast.success("Notes saved.")),
    onError: (e: Error) => toast.error(e.message),
  });

  if (detail.isError) return <p className="text-sm text-red-300">{(detail.error as Error).message}</p>;
  if (!d) return <p className="text-sm text-white/40">Loading…</p>;
  const e = d.evidence;
  const closed = ["won", "lost", "warning_closed"].includes(d.status);
  const fileUrl = (name: string) => `/api/admin/billing/disputes/${id}/files/${encodeURIComponent(name)}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/billing/disputes" className="inline-flex items-center gap-1.5 text-[13px] text-white/50 hover:text-white">
        <ArrowLeft className="size-4" /> Disputes
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {money(d.amount, d.currency)} disputed{d.reason ? ` · ${statusLabel(d.reason)}` : ""}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] text-white/50">
            <Badge tone={disputeStatusTone(d.status)}>{statusLabel(d.status)}</Badge>
            {d.accountSuspended && (
              <Badge tone="red">
                <ShieldOff className="mr-1 size-3" /> Account suspended
              </Badge>
            )}
            {d.subscriptionCanceled && <Badge tone="gray">Plan ended</Badge>}
            {d.fundsWithdrawn && <Badge tone="amber">Funds withdrawn</Badge>}
            {d.fundsReinstated && <Badge tone="green">Funds reinstated</Badge>}
            <span>
              Evidence due: {d.evidenceDueBy ? when(d.evidenceDueBy) : "—"} (<DueIn due={d.evidenceDueBy} status={d.status} />)
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="flex h-10 items-center gap-1.5 rounded-xl border border-white/[0.1] px-3 text-[13px] text-white/70 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={cn("size-4", refresh.isPending && "animate-spin")} /> Refresh evidence
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Upload the PDFs and fill the evidence in Stripe? It is saved as a draft; you submit it in Stripe.")) draft.mutate();
            }}
            disabled={!e || closed || draft.isPending}
            className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-1.5 rounded-xl px-4 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            {draft.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {d.stripeDraftAt ? "Send to Stripe again (draft)" : "Send to Stripe (draft)"}
          </button>
        </div>
      </div>
      {d.stripeDraftAt && (
        <p className="text-[13px] text-emerald-300">
          Sent to Stripe as a draft {when(d.stripeDraftAt)}. Open the dispute in Stripe to review and submit it.
        </p>
      )}
      {d.evidenceError && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-[13px] text-red-200">Gathering the evidence failed: {d.evidenceError}</p>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Section title="Dispute">
            <Facts
              rows={[
                ["Customer", <UserLink key="u" userId={d.userId} email={d.email} />],
                ["Opened", when(d.stripeCreatedAt)],
                ["Dispute", <StripeId key="d" id={d.disputeId} />],
                ["Charge", <StripeId key="c" id={d.chargeId} />],
                ["Invoice", <StripeId key="i" id={d.invoiceId} />],
                ["Stripe customer", <StripeId key="cu" id={d.stripeCustomerId} />],
                ["Network reason code", d.networkReasonCode ?? "—"],
                ["Charge refundable", d.isChargeRefundable == null ? "—" : d.isChargeRefundable ? "Yes" : "No"],
                ["Closed", d.closedAt ? `${when(d.closedAt)} · ${d.outcome ? statusLabel(d.outcome) : ""}` : "—"],
              ]}
            />
          </Section>

          {!e ? (
            <Section title="Evidence">
              <p className="flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="size-4 animate-spin" /> Gathering the evidence…
              </p>
            </Section>
          ) : (
            <>
              <Section title="Customer" actions={<span className="text-[12px] text-white/35">Evidence gathered {when(e.builtAt)}</span>}>
                <Facts
                  rows={[
                    ["Name", e.customer.name ?? "—"],
                    ["Email", `${e.customer.email ?? "—"}${e.customer.emailVerified ? " (verified)" : ""}`],
                    ["Signed up", `${when(e.customer.signedUpAt)}${e.customer.signupMethod ? ` with ${e.customer.signupMethod}` : ""}`],
                    ["Account age", e.customer.accountAgeDays != null ? `${int(e.customer.accountAgeDays)} days` : "—"],
                    ["Terms accepted", e.customer.termsAcceptedAt ? `${when(e.customer.termsAcceptedAt)} (${e.customer.termsVersion ?? "—"})` : "—"],
                    ["Sign-up IP", e.customer.signupIp ? `${e.customer.signupIp}${e.customer.signupCountry ? ` · ${e.customer.signupCountry}` : ""}` : "—"],
                    ["Last IP", e.customer.lastIp ? `${e.customer.lastIp} · ${[e.customer.city, e.customer.country].filter(Boolean).join(", ")}` : "—"],
                    [
                      "Network",
                      [e.customer.isVpn && "VPN", e.customer.isProxy && "Proxy", e.customer.isDataCenter && "Data center"].filter(Boolean).join(", ") || "Residential",
                    ],
                  ]}
                />
              </Section>

              <Section title="Payment">
                <Facts
                  rows={[
                    ["Paid", `${money(e.payment.amount, e.payment.currency)} · ${when(e.payment.paidAt)}`],
                    ["Card", e.payment.card.brand ? `${e.payment.card.brand} •••• ${e.payment.card.last4} · ${e.payment.card.expiry ?? ""} · ${e.payment.card.funding ?? ""} · ${e.payment.card.country ?? ""}` : "—"],
                    ["Billing name", e.payment.billing.name ?? "—"],
                    ["Billing address", e.payment.billing.address ?? "—"],
                    ["CVC check", check(e.payment.card.cvcCheck)],
                    ["Address / postal check", <span key="a">{check(e.payment.card.addressLine1Check)} / {check(e.payment.card.postalCodeCheck)}</span>],
                    ["3D Secure", check(e.payment.card.threeDSecure)],
                    ["Wallet", e.payment.card.wallet ?? "—"],
                    ["Radar risk", e.payment.risk.level ? `${e.payment.risk.level}${e.payment.risk.score != null ? ` (${e.payment.risk.score})` : ""}` : "—"],
                    ["Network", e.payment.risk.sellerMessage ?? e.payment.risk.networkStatus ?? "—"],
                  ]}
                />
              </Section>

              <Section title="Service delivered">
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Generations", `${int(e.usage.totals.generations)}`, `${int(e.usage.totals.succeeded)} succeeded`],
                    ["Credits used", int(e.usage.totals.creditsUsed), `on ${int(e.usage.totals.activeDays)} days`],
                    ["Results", int(e.usage.totals.mediaCount), `${int(e.usage.totals.downloaded)} downloaded`],
                    ["Used between", day(e.usage.totals.firstAt), `and ${day(e.usage.totals.lastAt)}`],
                  ].map(([label, value, sub]) => (
                    <div key={label} className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                      <p className="text-[11px] text-white/45">{label}</p>
                      <p className="mt-1 text-lg font-bold text-white">{value}</p>
                      <p className="text-[11px] text-white/40">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-[13px]">
                    <thead className="text-[11px] tracking-wide text-white/40 uppercase">
                      <tr className="border-b border-white/[0.06]">
                        <th className="py-2 pr-3 font-medium">Payment</th>
                        <th className="py-2 pr-3 text-right font-medium">Amount</th>
                        <th className="py-2 pr-3 font-medium">Status</th>
                        <th className="py-2 font-medium">Used afterwards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.invoices.map((i, n) => (
                        <tr key={n} className="border-b border-white/[0.04]">
                          <td className="py-2 pr-3 text-white/60">{day(i.date)}</td>
                          <td className="py-2 pr-3 text-right text-white tabular-nums">
                            {money(i.amount, i.currency)}
                            {i.refunded ? <span className="text-white/40"> ({money(i.refunded, i.currency)} refunded)</span> : null}
                          </td>
                          <td className="py-2 pr-3 text-white/60">{i.status}</td>
                          <td className="py-2 text-white/80">{i.usedAfter ? `${int(i.usedAfter.credits)} credits · ${int(i.usedAfter.generations)} generations` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {e.usage.truncated && <p className="mt-2 text-[12px] text-white/40">Long history: the newest rows are kept; the totals count them.</p>}
              </Section>

              <Section title={`Sign-ins and actions (${e.activity.length})`}>
                {e.activity.length === 0 ? (
                  <p className="text-sm text-white/40">No activity recorded (older accounts were created before the activity log).</p>
                ) : (
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full min-w-[640px] text-left text-[12px]">
                      <thead className="sticky top-0 bg-[#141414] text-[11px] tracking-wide text-white/40 uppercase">
                        <tr>
                          <th className="py-1.5 pr-3 font-medium">Time</th>
                          <th className="py-1.5 pr-3 font-medium">Action</th>
                          <th className="py-1.5 pr-3 font-medium">IP · location</th>
                          <th className="py-1.5 font-medium">Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...e.activity].reverse().map((a, n) => (
                          <tr key={n} className="border-t border-white/[0.04]">
                            <td className="py-1.5 pr-3 whitespace-nowrap text-white/55">{when(a.at)}</td>
                            <td className="py-1.5 pr-3 text-white/85">
                              {statusLabel(a.action)}
                              {a.method ? <span className="text-white/40"> · {a.method}</span> : null}
                            </td>
                            <td className="py-1.5 pr-3 text-white/65">
                              {a.ip ?? "—"}
                              {a.location ? ` · ${a.location}` : ""}
                              {a.vpn ? <span className="text-amber-300"> · VPN</span> : null}
                            </td>
                            <td className="py-1.5 text-white/65">{[a.browser, a.os, a.device].filter(Boolean).join(" · ") || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {(e.access.apiKeys.length > 0 || e.access.appConnections.length > 0) && (
                  <p className="mt-3 text-[12px] text-white/50">
                    {e.access.apiKeys.length} API key(s), {e.access.appConnections.length} connected app(s) (revoked at suspension).
                  </p>
                )}
              </Section>

              <Section title="Communication">
                {e.communication.tickets.length === 0 ? (
                  <p className="text-sm text-white/40">The customer did not contact support.</p>
                ) : (
                  <div className="space-y-3">
                    {e.communication.tickets.map((t, n) => (
                      <div key={n} className="rounded-xl border border-white/[0.06] p-3">
                        <p className="text-[13px] font-semibold text-white">
                          {t.topic ?? "Support ticket"} <span className="font-normal text-white/40">{t.code} · {when(t.openedAt)} · {t.status}</span>
                        </p>
                        {t.messages.map((m, k) => (
                          <p key={k} className="mt-1.5 text-[12px] text-white/70">
                            <span className="font-semibold text-white/85">{m.from}</span> <span className="text-white/35">{when(m.at)}</span> — {m.body}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                {!!e.communication.emails?.length && (
                  <div className="mt-4">
                    <p className="mb-1.5 text-[12px] font-semibold text-white/55">Emails we sent ({e.communication.emails.length})</p>
                    <ul className="max-h-40 space-y-0.5 overflow-y-auto text-[12px] text-white/65">
                      {e.communication.emails.map((m, n) => (
                        <li key={n}>
                          <span className="text-white/35">{when(m.at)}</span> · {m.subject ?? "—"}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>

              {d.stripeText && (
                <Section title="Text for Stripe" actions={<span className="text-[12px] text-white/35">The draft fills these; copy them if you answer in Stripe by hand.</span>}>
                  <div className="space-y-3">
                    {Object.entries(d.stripeText)
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <CopyText key={k} label={TEXT_LABELS[k] ?? k} value={v!} />
                      ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>

        <div className="space-y-6">
          <Section title="Downloads">
            {!e ? (
              <p className="text-sm text-white/40">Available once the evidence is gathered.</p>
            ) : (
              <>
                <p className="mb-3 text-[12px] text-white/45">
                  The PDFs are for Stripe (PDF, 4.5 MB in total). The spreadsheet and CSVs are for your own review. Files hold personal data: don&apos;t share them
                  outside Stripe.
                </p>
                <ul className="space-y-1.5">
                  {d.files.map((f) => (
                    <li key={f.name}>
                      <a
                        href={fileUrl(f.name)}
                        download
                        className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-[13px] text-white/80 hover:border-white/15 hover:text-white"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className={cn("size-4 shrink-0", f.forStripe ? "text-sky-300" : "text-white/40")} />
                          <span className="truncate">{f.label}</span>
                        </span>
                        <Download className="size-4 shrink-0 text-white/40" />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Section>

          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(ev) => setNotesDraft(ev.target.value.slice(0, 5000))}
              rows={5}
              placeholder="What you sent, who handled it…"
              className="w-full resize-y rounded-xl border border-white/[0.08] bg-black/30 p-3 text-[13px] text-white placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => saveNotes.mutate()}
              disabled={saveNotes.isPending || notes === (d.notes ?? "")}
              className="mt-2 h-9 rounded-lg border border-white/[0.1] px-3 text-[13px] text-white/80 hover:text-white disabled:opacity-40"
            >
              {saveNotes.isPending ? "Saving…" : "Save notes"}
            </button>
          </Section>

          <Section title="Timeline">
            <Timeline items={d.timeline} />
          </Section>
        </div>
      </div>
    </div>
  );
}
