"use client";

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

export type PaymentHistoryItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
};

export function optimisticAddPayment(payment: PaymentHistoryItem): () => void {
  const key = ["payments-history"];
  const previous = queryClient.getQueryData<PaymentHistoryItem[]>(key) ?? [];
  queryClient.setQueryData<PaymentHistoryItem[]>(key, [payment, ...previous]);
  return () => queryClient.setQueryData(key, previous);
}
