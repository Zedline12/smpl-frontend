import SecurityDashboard from "@/features/admin/security/components/SecurityDashboard";

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Security</h1>
        <p className="text-sm text-white/50">
          Monitor flagged users, manage suspensions, and review IP and threat data.
        </p>
      </div>
      <SecurityDashboard />
    </div>
  );
}
