"use client";

import { User } from "@/features/auth/types/auth";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<any>(null);

export default function AuthProvider({
  user,
  children,
}: {
  user: User & { subscription: { id:string,name: string } };
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState(user);

  return (
    <AuthContext.Provider value={{ user: currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Outside the protected/public layouts (e.g. the admin dashboard) there is no provider.
export const useAuth = () =>
  useContext(AuthContext) ?? { user: null, setCurrentUser: () => {} };
