import { cn } from "@/lib/utils";

interface Outcome {
  status: "active" | "ended" | "removed";
  paidFullPriceAfter: boolean;
  canceledAt: string | null;
  subscriptionEndedAt: string | null;
  endedWhileDiscounted: boolean;
  endedWithinDaysOfDiscountEnd: number | null;
}

const badge = "rounded-full border px-2 py-0.5 text-[11px] font-medium";

/** What happened after a coupon: still running, paid full price, canceled during/after it. */
export function RedemptionOutcome({ redemption: r, className }: { redemption: Outcome; className?: string }) {
  const items: { label: string; tone: string }[] = [];
  if (r.status === "active" && !r.canceledAt)
    items.push({ label: "Discount running", tone: "border-sky-500/30 bg-sky-500/10 text-sky-300" });
  if (r.status === "removed") items.push({ label: "Removed", tone: "border-white/10 bg-white/5 text-white/50" });
  if (r.paidFullPriceAfter)
    items.push({ label: "Paid full price after", tone: "border-green-500/30 bg-green-500/10 text-green-300" });
  if (r.canceledAt) {
    const when = r.subscriptionEndedAt ? "Canceled" : "Canceling";
    if (r.endedWhileDiscounted)
      items.push({ label: `${when} while discounted`, tone: "border-red-500/30 bg-red-500/10 text-red-300" });
    else if (r.endedWithinDaysOfDiscountEnd != null)
      items.push({
        label: `${when} ${r.endedWithinDaysOfDiscountEnd} day${r.endedWithinDaysOfDiscountEnd === 1 ? "" : "s"} after discount`,
        tone: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      });
    else items.push({ label: when, tone: "border-red-500/30 bg-red-500/10 text-red-300" });
  }
  if (!items.length) items.push({ label: "Discount ended", tone: "border-white/10 bg-white/5 text-white/50" });

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((i) => (
        <span key={i.label} className={cn(badge, i.tone)}>
          {i.label}
        </span>
      ))}
    </div>
  );
}
