// app/providers.tsx
"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { CatalogSync } from "@/features/catalog/CatalogSync";

/**
 * Data stays fresh for 30 s, so moving between pages reuses it instead of refetching
 * every query on every mount and every tab focus. What changes on its own (credits,
 * media, jobs) is refreshed by live events (LiveEventsProvider); queries that need
 * other timing set their own staleTime / refetchInterval.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Names and visibility of what we sell (admin-editable). */}
      <CatalogSync />
      <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
