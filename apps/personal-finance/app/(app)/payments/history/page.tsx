"use client";

import { useQuery } from "@tanstack/react-query";
import { Badge, Card } from "@clearbank/ui";
import type { PaymentHistoryItem } from "../../../../src/lib/queryClient";

const fallback: PaymentHistoryItem[] = [
  { id: "p1", amount: 50, currency: "GBP", status: "COMPLETED", description: "Dinner split", createdAt: "2026-05-01" },
  { id: "p2", amount: 120, currency: "GBP", status: "FAILED", description: "Rent", createdAt: "2026-05-02" },
];

export default function PaymentsHistoryPage() {
  const { data } = useQuery({
    queryKey: ["payments-history"],
    queryFn: async () => fallback,
    initialData: fallback,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Payment History</h1>
      {data.map((item) => (
        <Card key={item.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency }).format(item.amount)}
              </p>
              <Badge>{item.status}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
