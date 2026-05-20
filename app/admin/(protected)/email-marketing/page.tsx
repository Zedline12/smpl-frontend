import EmailMarketingPageClient from "@/features/admin/email-marketing/components/EmailMarketingPageClient";

export default function EmailMarketingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Email Marketing</h2>
        <p className="text-muted-foreground">Target unpaid users with campaigns to convert them to paid subscribers.</p>
      </div>
      <EmailMarketingPageClient />
    </div>
  );
}
