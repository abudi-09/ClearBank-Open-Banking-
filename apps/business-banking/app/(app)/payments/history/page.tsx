"use client";

import { useState } from "react";

const rows = [
  { date: "2026-05-01", status: "COMPLETED", amount: 250.5, currency: "GBP", description: "Supplier A" },
  { date: "2026-05-03", status: "PENDING", amount: 90, currency: "EUR", description: "Supplier B" },
];

export default function PaymentHistoryPage() {
  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = rows.filter((r) => {
    if (status !== "ALL" && r.status !== status) return false;
    if (from && r.date < from) return false;
    if (to && r.date > to) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Payments History</h1>
      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-3">
        <select className="rounded border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {["ALL", "PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <input type="date" className="rounded border p-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className="rounded border p-2" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map((r, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p>{r.description}</p>
              <p>{r.status}</p>
            </div>
            <p className="text-sm text-slate-500">{r.date}</p>
            <p className="font-semibold">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: r.currency }).format(r.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
