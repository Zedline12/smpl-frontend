"use client";

import { User } from "@/features/auth/types/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { LiveEventsProvider } from "@/features/live/LiveEventsProvider";
import { PaymentFailedNotice } from "@/features/billing-result/PaymentFailedNotice";
import { OutOfCreditsModal } from "@/features/credit-packs/components/OutOfCreditsModal";

const AuthContext = createContext<any>(null);

export default function AuthProvider({
  user,
  children,
}: {
  user: User & { subscription: { id:string,name: string } };
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState(user);

  // The layout passes a new user after sign-in / sign-out (`router.refresh()`): follow it,
  // or the navbar keeps showing whoever was there when the page first loaded.
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user: currentUser, setCurrentUser }}>
      {children}
      <LiveEventsProvider />
      {currentUser && <PaymentFailedNotice />}
      {currentUser && <OutOfCreditsModal />}
    </AuthContext.Provider>
  );
}

// Outside the protected/public layouts (e.g. the admin dashboard) there is no provider.
export const useAuth = () =>
  useContext(AuthContext) ?? { user: null, setCurrentUser: () => {} };
