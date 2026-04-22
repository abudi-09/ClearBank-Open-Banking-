"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "../src/lib/queryClient";
import { hydrateAuthStore } from "../src/store/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateAuthStore();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
