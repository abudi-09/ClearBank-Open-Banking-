import { useEffect, useState } from "react";
import type { BulkPaymentInstruction, FxQuoteResponse } from "@clearbank/types";

const apiBase = import.meta.env.VITE_CLEARBANK_API_URL ?? "http://localhost:4000";

type Screen = "payments" | "fx" | "timeline";

export function App() {
  const [screen, setScreen] = useState<Screen>("payments");
  const [payments, setPayments] = useState<BulkPaymentInstruction[]>([]);
  const [csv, setCsv] = useState("biz-main-gbp,supplier-44,999.50,GBP,SUPPLIER-44");
  const [quote, setQuote] = useState<FxQuoteResponse | null>(null);
  const [amount, setAmount] = useState("2500");

  async function load() {
    const response = await fetch(`${apiBase}/business/payments`);
    setPayments((await response.json()) as BulkPaymentInstruction[]);
  }

  async function submitCsv() {
    const rows = csv.split("\n").filter(Boolean);
    for (const row of rows) {
      const [debtorAccountId, creditorAccountId, value, currency, reference] = row.split(",");
      await fetch(`${apiBase}/business/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          debtorAccountId,
          creditorAccountId,
          amount: { amount: value, currency },
          reference,
        }),
      });
    }
    await load();
  }

  async function requestFx() {
    const response = await fetch(`${apiBase}/business/fx/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base: "GBP", quote: "USD", amount }),
    });
    setQuote((await response.json()) as FxQuoteResponse);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="container">
      <h1>ClearBank Business</h1>
      <p>Upload bulk payouts and quote FX conversions.</p>
      <div className="tabs">
        <button onClick={() => setScreen("payments")}>Bulk Payments</button>
        <button onClick={() => setScreen("fx")}>FX Desk</button>
        <button onClick={() => setScreen("timeline")}>Activity</button>
      </div>

      {screen === "payments" && (
        <section className="card">
          <h2>CSV Payment Upload</h2>
          <textarea rows={5} value={csv} onChange={(event) => setCsv(event.target.value)} />
          <button onClick={() => void submitCsv()}>Queue Payments</button>
          <p>Queued: {payments.length}</p>
        </section>
      )}

      {screen === "fx" && (
        <section className="card">
          <h2>FX Quote</h2>
          <div className="row">
            <input value={amount} onChange={(event) => setAmount(event.target.value)} />
            <button onClick={() => void requestFx()}>Quote GBP/USD</button>
          </div>
          {quote && (
            <p>
              Rate {quote.rate}, converted amount {quote.convertedAmount}, expires {new Date(quote.expiresAt).toLocaleTimeString()}
            </p>
          )}
        </section>
      )}

      {screen === "timeline" && (
        <section className="card">
          <h2>Recent Instructions</h2>
          {payments.map((payment) => (
            <p key={payment.id}>
              {payment.reference}: {payment.amount.amount} {payment.amount.currency}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
