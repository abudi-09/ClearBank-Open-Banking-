"use client";

import { useEffect, useState } from "react";
import { Button } from "@clearbank/ui";

const currencies = ["USD", "EUR", "GBP", "ETB", "KES", "AED", "SAR", "INR", "GHS", "NGN"];

export function FXConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("GBP");
  const [to, setTo] = useState("USD");
  const [rate, setRate] = useState(1.2);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/fx/rates?base=${from}`);
        const data = (await res.json()) as { rates?: Record<string, number> };
        setRate(data.rates?.[to] ?? 1);
      } catch {
        setRate(1);
      }
    })();
  }, [from, to]);

  async function exchange() {
    setStatus("Processing...");
    try {
      await fetch("/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: "biz-main",
          toAccountId: "fx-ledger",
          amount,
          currency: from,
          description: `FX ${from}->${to}`,
          type: "FX",
        }),
      });
      setStatus("Exchange submitted.");
    } catch {
      setStatus("Exchange failed.");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <input type="number" className="w-full rounded border p-2" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded border p-2" value={from} onChange={(e) => setFrom(e.target.value)}>
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select className="rounded border p-2" value={to} onChange={(e) => setTo(e.target.value)}>
          {currencies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className="text-sm text-slate-600">Live rate: 1 {from} = {rate.toFixed(4)} {to}</p>
      <p className="text-lg font-semibold">Converted: {(amount * rate).toFixed(2)} {to}</p>
      <Button onClick={exchange}>Exchange</Button>
      {!!status && <p className="text-sm">{status}</p>}
    </div>
  );
}
