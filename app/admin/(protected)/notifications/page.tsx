import { NotificationsHistory } from "@/features/admin/notifications/components/NotificationsHistory";
import { MobileDevicesCard } from "@/features/admin/notifications/components/MobileDevicesCard";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <p className="text-sm text-white/50">
          Every alert with its date: payments, cancellations, refunds, blocked IPs and risky users.
        </p>
      </div>
      <MobileDevicesCard />
      <NotificationsHistory />
    </div>
  );
}
