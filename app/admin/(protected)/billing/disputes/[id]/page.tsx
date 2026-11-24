import { DisputeDetail } from "@/features/admin/billing-records/DisputeDetail";

/** One dispute: Stripe's facts, what we did, the evidence, downloads and the Stripe draft. */
export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-6">
      <DisputeDetail id={id} />
    </div>
  );
}
