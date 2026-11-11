import { Suspense } from "react";
import { MyTicketsPage } from "@/features/support/components/MyTicketsPage";

export default function SupportSettingsPage() {
  return (
    <Suspense>
      <MyTicketsPage />
    </Suspense>
  );
}
