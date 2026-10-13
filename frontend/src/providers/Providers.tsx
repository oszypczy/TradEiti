import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "../components/ui/ToastProvider";
import { queryKeys } from "../config/queryKeys";

interface Props {
  children?: React.ReactNode;
}

// Offers are always refetched when a page mounts; the USOS timetable (which changes rarely
// and is slow to fetch) is cached for a few minutes.
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});
queryClient.setQueryDefaults(queryKeys.courses, { staleTime: 5 * 60_000 });
queryClient.setQueryDefaults(["courseGroups"], { staleTime: 5 * 60_000 });

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
