import { CouponDetailClient } from "@/features/admin/discounts/components/CouponDetailClient";

export default async function CouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CouponDetailClient couponId={id} />;
}
