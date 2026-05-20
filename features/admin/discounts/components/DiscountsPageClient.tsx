"use client";

import { useState } from "react";
import { Tag, Copy, Check, Trash2, Plus } from "lucide-react";

type Duration = "once" | "forever" | "repeating";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percent" | "fixed";
  duration: Duration;
  durationMonths?: number;
  expiresAt?: string;
  uses: number;
  active: boolean;
  createdAt: string;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: "1",
    code: "LAUNCH50",
    discount: 50,
    type: "percent",
    duration: "once",
    uses: 142,
    active: true,
    createdAt: "2025-01-10",
  },
  {
    id: "2",
    code: "FOREVER20",
    discount: 20,
    type: "percent",
    duration: "forever",
    uses: 38,
    active: true,
    createdAt: "2025-03-01",
  },
  {
    id: "3",
    code: "3MONTHS30",
    discount: 30,
    type: "percent",
    duration: "repeating",
    durationMonths: 3,
    uses: 21,
    active: false,
    expiresAt: "2025-05-01",
    createdAt: "2025-02-15",
  },
];

const DURATION_OPTIONS: { value: Duration; label: string; description: string }[] = [
  { value: "once", label: "Once", description: "Only the first invoice is discounted" },
  { value: "forever", label: "Forever", description: "Every renewal is discounted" },
  { value: "repeating", label: "Repeating", description: "Discounted for a set number of months" },
];

function CouponBadge({ coupon }: { coupon: Coupon }) {
  const durationLabel =
    coupon.duration === "once"
      ? "First invoice"
      : coupon.duration === "forever"
      ? "Forever"
      : `${coupon.durationMonths} months`;

  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
      {durationLabel}
    </span>
  );
}

export default function DiscountsPageClient() {
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS);
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [duration, setDuration] = useState<Duration>("once");
  const [durationMonths, setDurationMonths] = useState("3");
  const [expiresAt, setExpiresAt] = useState("");

  const handleCopy = (couponCode: string, id: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleCreate = () => {
    if (!code.trim() || !discount) return;
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: code.trim().toUpperCase(),
      discount: Number(discount),
      type: discountType,
      duration,
      durationMonths: duration === "repeating" ? Number(durationMonths) : undefined,
      expiresAt: expiresAt || undefined,
      uses: 0,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    setCode("");
    setDiscount("");
    setDuration("once");
    setDurationMonths("3");
    setExpiresAt("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Coupons", value: coupons.length, color: "text-foreground" },
          { label: "Active", value: coupons.filter((c) => c.active).length, color: "text-green-400" },
          { label: "Total Uses", value: coupons.reduce((s, c) => s + c.uses, 0), color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-neutral-800/50 px-5 py-4"
          >
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Create coupon button / form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium text-white"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-neutral-900 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-white">New Coupon</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wider">Coupon Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER50"
                className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wider">Discount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="20"
                  min={1}
                  className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                  className="rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="percent">%</option>
                  <option value="fixed">$</option>
                </select>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider">Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    duration === opt.value
                      ? "border-blue-500/50 bg-blue-500/10 text-white"
                      : "border-white/10 bg-neutral-800/50 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-[11px] mt-0.5 leading-snug opacity-70">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Repeating months */}
          {duration === "repeating" && (
            <div className="space-y-1.5">
              <label className="text-xs text-white/50 uppercase tracking-wider">Number of Months</label>
              <input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                min={1}
                className="w-32 rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Expiry */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider">Expiry Date (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleCreate}
              disabled={!code.trim() || !discount}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium text-white"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium text-white/60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupons table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-900/60">
              {["Code", "Discount", "Duration", "Uses", "Expires", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-white/40 uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="bg-neutral-900 hover:bg-neutral-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-white/30" />
                    <span className="font-mono font-semibold text-white/90">{coupon.code}</span>
                    <button
                      onClick={() => handleCopy(coupon.code, coupon.id)}
                      className="text-white/30 hover:text-white/70 transition-colors"
                    >
                      {copiedId === coupon.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/80">
                  {coupon.discount}{coupon.type === "percent" ? "%" : "$"} off
                </td>
                <td className="px-4 py-3">
                  <CouponBadge coupon={coupon} />
                </td>
                <td className="px-4 py-3 text-white/60 tabular-nums">{coupon.uses}</td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {coupon.expiresAt ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggle(coupon.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
                      coupon.active
                        ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                        : "bg-neutral-700/50 text-white/40 border-white/10 hover:bg-neutral-700"
                    }`}
                  >
                    {coupon.active ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="text-white/30 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {coupons.length === 0 && (
          <div className="py-16 text-center text-white/30 text-sm">
            No coupons yet. Create your first one above.
          </div>
        )}
      </div>
    </div>
  );
}
