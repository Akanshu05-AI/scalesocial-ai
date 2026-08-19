"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { makeQueryClient } from "@/lib/query-client";
import { ToastProvider } from "@/components/ui/toast";
import { AuthListener } from "@/features/auth/components/AuthListener";
import { ThemeListener } from "@/providers/ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  // useState (not module scope) so each request/session gets its own client
  // under the App Router's server/client boundary.
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeListener />
        <AuthListener />
        {children}
      </ToastProvider>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
