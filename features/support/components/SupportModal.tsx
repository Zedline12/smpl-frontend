"use client";

import React, { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCircle2,
  Coins,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { isFreePlan } from "@/lib/subscription";
import { cn } from "@/lib/utils";
import { refundGeneration } from "@/features/generation/api/generation";
import { createSupportTicket, fetchSupportGenerations, fetchSupportInvoices } from "../api";
import {
  formatDate,
  formatMoney,
  SupportCategoryKey,
  SupportGenerationOption,
  SupportInvoiceOption,
  timeAgo,
} from "../types";
import { ScreenshotsField } from "./ScreenshotsField";

interface SupportModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: {
  key: SupportCategoryKey;
  label: string;
  description: string;
  icon: React.ElementType;
  paidOnly?: boolean;
}[] = [
  { key: "billing", label: "Billing", description: "Refunds, cancelling, charges", icon: CreditCard, paidOnly: true },
  { key: "generations", label: "Generations", description: "Stuck, failed or bad results", icon: Sparkles },
  { key: "credits", label: "Credits", description: "Missing or lost credits", icon: Coins },
  { key: "account", label: "Account & login", description: "Sign-in, email, profile", icon: UserRound },
  { key: "other", label: "Bug / other", description: "Anything else", icon: Bug },
];

const TOPICS: Partial<Record<SupportCategoryKey, { key: string; label: string }[]>> = {
  billing: [
    { key: "refund", label: "Refund" },
    { key: "cancel", label: "Cancel subscription" },
  ],
  generations: [
    { key: "stuck", label: "Stuck" },
    { key: "failed", label: "Failed" },
    { key: "bad_result", label: "Bad result" },
  ],
  credits: [
    { key: "missing_after_payment", label: "Missing after payment" },
    { key: "not_refunded", label: "Not refunded" },
    { key: "balance_wrong", label: "Balance looks wrong" },
  ],
};

const MAX_JOBS = 5;

const card = "rounded-xl border border-white/[0.08] bg-white/[0.03]";
const selectedCard = "border-white/40 bg-white/[0.08]";

export function SupportModal({ open, onClose }: SupportModalProps) {
  const { user } = useCurrentUser();
  // No session means the suspended-account form (token cookie only).
  const signedIn = !!user;
  const isPaid = signedIn && !isFreePlan(user);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"category" | "details" | "success">("category");
  const [category, setCategory] = useState<SupportCategoryKey | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [jobIds, setJobIds] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [existingCode, setExistingCode] = useState<string | null>(null);
  const [supportCode, setSupportCode] = useState("");
  const [refunding, setRefunding] = useState<string | null>(null);
  const [refunded, setRefunded] = useState<Record<string, true>>({});

  const needsInvoices =
    open && isPaid && (category === "billing" || (category === "credits" && topic === "missing_after_payment"));
  const needsJobs =
    open && signedIn && (category === "generations" || (category === "credits" && topic === "not_refunded"));

  const invoicesQuery = useQuery({
    queryKey: ["support-invoices"],
    queryFn: fetchSupportInvoices,
    enabled: needsInvoices,
    staleTime: 60_000,
  });
  const jobsQuery = useQuery({
    queryKey: ["support-generations"],
    queryFn: fetchSupportGenerations,
    enabled: needsJobs,
    staleTime: 30_000,
  });

  const categories = CATEGORIES.filter((c) => {
    if (!signedIn) return c.key === "account" || c.key === "other";
    return !c.paidOnly || isPaid;
  });

  const resetForm = () => {
    setTopic(null);
    setInvoiceId(null);
    setJobIds([]);
    setBody("");
    setAttachments([]);
    setResetKey((k) => k + 1);
    setError("");
    setExistingCode(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("category");
      setCategory(null);
      resetForm();
      setSupportCode("");
      setRefunded({});
    }, 300);
  };

  const pickCategory = (key: SupportCategoryKey) => {
    resetForm();
    setCategory(key);
    setStep("details");
  };

  const pickTopic = (key: string) => {
    setTopic(key);
    setInvoiceId(null);
    setJobIds([]);
    setError("");
    setExistingCode(null);
  };

  const jobList: SupportGenerationOption[] = useMemo(() => {
    const lists = jobsQuery.data;
    if (!lists) return [];
    if (category === "credits") return lists.failed;
    if (topic === "stuck") return lists.stuck;
    if (topic === "failed") return lists.failed;
    if (topic === "bad_result") return lists.recent;
    return [];
  }, [jobsQuery.data, category, topic]);

  const toggleJob = (id: string) =>
    setJobIds((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : prev.length >= MAX_JOBS ? prev : [...prev, id],
    );

  const instantRefund = async (job: SupportGenerationOption) => {
    setRefunding(job.jobId);
    setError("");
    try {
      await refundGeneration(job.jobId);
      setRefunded((r) => ({ ...r, [job.jobId]: true }));
      setJobIds((prev) => prev.filter((j) => j !== job.jobId));
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.refetchQueries({ queryKey: ["generation-queues"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't refund this generation");
    } finally {
      setRefunding(null);
    }
  };

  const topics = category ? TOPICS[category] : undefined;
  const hasPick = !!invoiceId || jobIds.length > 0;
  const bodyOptional = hasPick;
  const canSubmit =
    !!category &&
    (!topics || !!topic) &&
    (category !== "billing" || !!invoiceId) &&
    (bodyOptional || body.trim().length > 0) &&
    !uploading &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit || !category) return;
    setIsSubmitting(true);
    setError("");
    setExistingCode(null);
    try {
      const ticket = await createSupportTicket({
        category,
        ...(topic ? { topic } : {}),
        ...(body.trim() ? { body: body.trim() } : {}),
        ...(invoiceId ? { invoiceId } : {}),
        ...(jobIds.length ? { jobIds } : {}),
        ...(attachments.length ? { attachments } : {}),
      });
      setSupportCode(ticket.supportCode);
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["support-invoices"] });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
      const code = message.match(/SUP-[A-Z0-9]{6}/)?.[0];
      if (code) setExistingCode(code);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAttachments = useCallback((keys: string[]) => setAttachments(keys), []);
  const categoryInfo = CATEGORIES.find((c) => c.key === category);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-[560px]"
        style={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {step === "category" && (
          <>
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle className="text-lg font-bold text-white">Contact Support</DialogTitle>
              <p className="mt-1 text-[13px] text-white/45">What do you need help with?</p>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-2">
              {categories.map(({ key, label, description, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => pickCategory(key)}
                  className={cn(card, "flex items-start gap-3 p-3.5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.06]")}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07]">
                    <Icon className="size-4 text-white/80" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-white">{label}</span>
                    <span className="block text-[12px] text-white/40">{description}</span>
                  </span>
                </button>
              ))}
            </div>
            {signedIn && (
              <p className="px-6 pb-5 text-[12px] text-white/35">
                Already opened a ticket?{" "}
                <Link href="/me/settings/support" onClick={handleClose} className="text-white/70 underline-offset-2 hover:underline">
                  See your tickets
                </Link>
              </p>
            )}
          </>
        )}

        {step === "details" && category && (
          <>
            <DialogHeader className="px-6 pt-6 pb-0">
              <button
                onClick={() => {
                  setStep("category");
                  setCategory(null);
                  resetForm();
                }}
                className="mb-2 flex w-fit items-center gap-1 text-[12px] text-white/45 hover:text-white/80"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <DialogTitle className="text-lg font-bold text-white">{categoryInfo?.label}</DialogTitle>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5">
              {/* Topic */}
              {topics && (
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-white/50">
                    {category === "billing" ? "What would you like?" : "What happened?"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => pickTopic(t.key)}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                          topic === t.key
                            ? "border-white bg-white text-black"
                            : "border-white/15 text-white/65 hover:border-white/35 hover:text-white",
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {topic && needsInvoices && (
                <InvoicePicker
                  required={category === "billing"}
                  refund={category === "billing" && topic === "refund"}
                  loading={invoicesQuery.isLoading}
                  error={invoicesQuery.error}
                  invoices={invoicesQuery.data ?? []}
                  selected={invoiceId}
                  onSelect={(id) => setInvoiceId((cur) => (cur === id ? null : id))}
                />
              )}

              {/* Generations */}
              {topic && needsJobs && (
                <div>
                  <p className="mb-1.5 text-[12px] font-semibold text-white/50">
                    {topic === "stuck"
                      ? "Which generation is stuck?"
                      : topic === "bad_result"
                        ? "Which result was bad?"
                        : "Which generation failed?"}{" "}
                    <span className="font-normal text-white/30">(up to {MAX_JOBS})</span>
                  </p>
                  {jobsQuery.isLoading ? (
                    <ListSkeleton />
                  ) : jobsQuery.error ? (
                    <p className="text-[12px] text-red-400">{(jobsQuery.error as Error).message}</p>
                  ) : jobList.length === 0 ? (
                    <p className={cn(card, "p-3 text-[12px] text-white/40")}>
                      {topic === "stuck"
                        ? "Nothing is stuck right now. Generations count as stuck after 2 minutes."
                        : "No generations in the last 30 days. You can still describe the problem below."}
                    </p>
                  ) : (
                    <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                      {jobList.map((job) => (
                        <JobRow
                          key={job.jobId}
                          job={job}
                          selected={jobIds.includes(job.jobId)}
                          disabled={!jobIds.includes(job.jobId) && jobIds.length >= MAX_JOBS}
                          refunded={!!refunded[job.jobId]}
                          refunding={refunding === job.jobId}
                          showInstantRefund={topic === "stuck"}
                          onToggle={() => toggleJob(job.jobId)}
                          onRefund={() => instantRefund(job)}
                        />
                      ))}
                    </div>
                  )}
                  {Object.keys(refunded).length > 0 && (
                    <p className="mt-2 flex items-center gap-1.5 text-[12px] text-emerald-300">
                      <CheckCircle2 className="size-3.5" /> Credits refunded. No ticket needed, but you can still send one.
                    </p>
                  )}
                  {category === "generations" && topic === "failed" && jobList.length > 0 && (
                    <p className="mt-2 text-[11px] text-white/35">
                      Failed generations are refunded automatically. Tell us if your credits didn&apos;t come back.
                    </p>
                  )}
                </div>
              )}

              {/* Message + screenshots, once there's a topic (or none needed) */}
              {(!topics || topic) && (
                <>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-white/50">
                      {bodyOptional ? "Anything else we should know? (optional)" : "Describe your issue"}
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder={
                        category === "billing"
                          ? "Optional: tell us why, it helps us improve."
                          : "Please include as much detail as you can…"
                      }
                      rows={4}
                      maxLength={5000}
                      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[13px] text-white/85 focus:border-white/30 focus:outline-none"
                    />
                    <p className="mt-1 text-right text-[11px] text-white/25">{body.length}/5000</p>
                  </div>
                  {signedIn && (
                    <ScreenshotsField key={resetKey} onChange={onAttachments} onUploadingChange={setUploading} />
                  )}
                </>
              )}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-[12px] text-red-300">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {error}
                    {existingCode && (
                      <>
                        {" "}
                        <Link
                          href={`/me/settings/support?ticket=${existingCode}`}
                          onClick={handleClose}
                          className="font-semibold text-white underline-offset-2 hover:underline"
                        >
                          Open {existingCode}
                        </Link>
                      </>
                    )}
                  </span>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[13px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                  {isSubmitting ? "Submitting…" : uploading ? "Uploading…" : "Submit request"}
                </button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/10">
              <CheckCircle2 className="size-8 text-emerald-400" />
            </div>
            <div>
              <h2 className="mb-1 text-lg font-bold text-white">Ticket submitted</h2>
              <p className="text-[13px] text-white/50">
                We usually reply within <strong className="text-white">24 hours</strong>. We&apos;ll email you and you can
                follow it in Settings.
              </p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.05] px-6 py-3">
              <p className="mb-1 text-[11px] font-bold tracking-widest text-white/30 uppercase">Support code</p>
              <p className="font-mono text-2xl font-black text-white">{supportCode}</p>
            </div>
            <div className="mt-2 flex gap-2">
              {signedIn && (
                <Link
                  href={`/me/settings/support?ticket=${supportCode}`}
                  onClick={handleClose}
                  className="rounded-xl border border-white/15 px-5 py-2.5 text-[13px] font-medium text-white/80 hover:bg-white/5"
                >
                  View ticket
                </Link>
              )}
              <button
                onClick={handleClose}
                className="rounded-xl bg-white px-8 py-2.5 text-[13px] font-semibold text-black hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-white/[0.04]" />
      ))}
    </div>
  );
}

function InvoicePicker({
  required,
  refund,
  loading,
  error,
  invoices,
  selected,
  onSelect,
}: {
  required: boolean;
  refund: boolean;
  loading: boolean;
  error: unknown;
  invoices: SupportInvoiceOption[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-semibold text-white/50">
        Which payment is this about? {!required && <span className="font-normal text-white/30">(optional)</span>}
      </p>
      {loading ? (
        <ListSkeleton />
      ) : error ? (
        <p className="text-[12px] text-red-400">{(error as Error).message}</p>
      ) : invoices.length === 0 ? (
        <p className={cn(card, "p-3 text-[12px] text-white/40")}>No payments in the last 12 months.</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
          {invoices.map((inv) => {
            const blocked = (refund && inv.fullyRefunded) || !!inv.openTicketCode;
            const isSelected = selected === inv.id;
            return (
              <button
                key={inv.id}
                disabled={blocked}
                onClick={() => onSelect(inv.id)}
                className={cn(
                  card,
                  "flex w-full items-center gap-3 p-3 text-left transition-colors",
                  isSelected ? selectedCard : "hover:border-white/20",
                  blocked && "cursor-not-allowed opacity-45",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-white bg-white" : "border-white/30",
                  )}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-black" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-white">{inv.name}</span>
                  <span className="block text-[11px] text-white/40">Paid {formatDate(inv.paidAt)}</span>
                </span>
                <span className="text-right">
                  <span className="block text-[13px] font-semibold text-white">{formatMoney(inv.amount, inv.currency)}</span>
                  {inv.openTicketCode ? (
                    <span className="block text-[10px] text-amber-300/80">Ticket {inv.openTicketCode} open</span>
                  ) : inv.fullyRefunded ? (
                    <span className="block text-[10px] text-white/40">Refunded</span>
                  ) : inv.amountRefunded > 0 ? (
                    <span className="block text-[10px] text-white/40">
                      {formatMoney(inv.amountRefunded, inv.currency)} refunded
                    </span>
                  ) : null}
                </span>
                {inv.hostedInvoiceUrl && (
                  <a
                    href={inv.hostedInvoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-white/30 hover:text-white/70"
                    aria-label="View invoice"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobRow({
  job,
  selected,
  disabled,
  refunded,
  refunding,
  showInstantRefund,
  onToggle,
  onRefund,
}: {
  job: SupportGenerationOption;
  selected: boolean;
  disabled: boolean;
  refunded: boolean;
  refunding: boolean;
  showInstantRefund: boolean;
  onToggle: () => void;
  onRefund: () => void;
}) {
  const statusLabel =
    job.status === "failure" ? "Failed" : job.status === "success" ? "Done" : job.status === "pending" ? "Queued" : "Processing";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && !refunded && onToggle()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled && !refunded) {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        card,
        "flex cursor-pointer items-center gap-3 p-3 transition-colors",
        selected ? selectedCard : "hover:border-white/20",
        (disabled || refunded) && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border",
          selected ? "border-white bg-white" : "border-white/30",
        )}
      >
        {selected && <CheckCircle2 className="size-3 text-black" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-white">{job.prompt || "(no prompt)"}</span>
        <span className="block truncate text-[11px] text-white/40">
          {job.model} · {timeAgo(job.createdAt)}
          {job.credits ? ` · ${job.credits} credits` : ""}
          {job.failedMessage ? ` · ${job.failedMessage}` : ""}
        </span>
      </span>
      {showInstantRefund && job.canInstantRefund && !refunded ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRefund();
          }}
          disabled={refunding}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-black hover:opacity-90 disabled:opacity-50"
        >
          {refunding && <Loader2 className="size-3 animate-spin" />}
          Refund now
        </button>
      ) : (
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
            refunded
              ? "bg-emerald-400/15 text-emerald-300"
              : job.status === "failure"
                ? "bg-red-400/15 text-red-300"
                : job.status === "success"
                  ? "bg-white/10 text-white/60"
                  : "bg-amber-400/15 text-amber-300",
          )}
        >
          {refunded ? "Refunded" : statusLabel}
        </span>
      )}
    </div>
  );
}
