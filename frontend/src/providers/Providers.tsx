import React from "react";
import { AuthProvider } from "./AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children?: React.ReactNode;
}

const queryClient = new QueryClient();

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
