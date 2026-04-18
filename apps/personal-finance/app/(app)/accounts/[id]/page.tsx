"use client";

import { useState } from "react";
import { TransactionRow } from "../../../components/TransactionRow";

const data = [
  { type: "DEBIT", description: "Groceries", amount: 50, currency: "GBP", date: "2026-05-01", status: "COMPLETED" },
  { type: "CREDIT", description: "Refund", amount: 20, currency: "GBP", date: "2026-05-02", status: "COMPLETED" },
];

export default function AccountTransactionsPage() {
  const [type, setType] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = data.filter((row) => {
    if (type !== "ALL" && row.type !== type) return false;
    if (from && row.date < from) return false;
    if (to && row.date > to) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transaction History</h1>
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3">
        <select className="rounded border p-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option>ALL</option>
          <option>DEBIT</option>
          <option>CREDIT</option>
          <option>TRANSFER</option>
          <option>FX</option>
        </select>
        <input className="rounded border p-2" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="rounded border p-2" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div className="space-y-2">
        {filtered.map((item, idx) => (
          <TransactionRow key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}
