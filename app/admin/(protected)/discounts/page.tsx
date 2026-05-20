import DiscountsPageClient from "@/features/admin/discounts/components/DiscountsPageClient";

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Discounts</h2>
        <p className="text-muted-foreground">Create and manage discount coupons for subscriptions.</p>
      </div>
      <DiscountsPageClient />
    </div>
  );
}
