import { Suspense } from "react";
import { SupportAdminPage } from "@/features/admin/support/components/SupportAdminPage";

export default function AdminSupportPage() {
  return (
    <Suspense>
      <SupportAdminPage />
    </Suspense>
  );
}
