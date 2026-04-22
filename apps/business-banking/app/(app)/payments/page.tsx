"use client";

import { Button, Input } from "@clearbank/ui";
import { useState } from "react";

export default function PaymentsPage() {
  const [form, setForm] = useState({ iban: "", amount: "", currency: "GBP", description: "" });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Single Payment</h1>
      <form className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <Input placeholder="Recipient IBAN" value={form.iban} onChange={(e) => setForm((s) => ({ ...s, iban: e.target.value }))} />
        <Input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} />
        <select className="w-full rounded border p-2" value={form.currency} onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}>
          {["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"].map((c) => <option key={c}>{c}</option>)}
        </select>
        <Input placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        <Button type="button" onClick={() => alert("Payment submitted")}>Send Payment</Button>
      </form>
    </div>
  );
}
