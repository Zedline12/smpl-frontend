import DiscountsPageClient from "@/features/admin/discounts/components/DiscountsPageClient";

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Discounts</h2>
        <p className="text-muted-foreground">
          Coupons and codes for subscriptions: who used them, what they cost, and whether those customers stayed.
        </p>
      </div>
      <DiscountsPageClient />
    </div>
  );
}
