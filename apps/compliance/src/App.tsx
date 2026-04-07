import { useEffect, useMemo, useState } from "react";
import type { AmlAlert, KycDocumentReview } from "@clearbank/types";

const apiBase = import.meta.env.VITE_CLEARBANK_API_URL ?? "http://localhost:4000";

type Screen = "queue" | "alerts" | "metrics";

const severityScore: Record<AmlAlert["severity"], number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function App() {
  const [screen, setScreen] = useState<Screen>("queue");
  const [kyc, setKyc] = useState<KycDocumentReview[]>([]);
  const [alerts, setAlerts] = useState<AmlAlert[]>([]);

  async function load() {
    const [kycRes, amlRes] = await Promise.all([
      fetch(`${apiBase}/compliance/kyc`),
      fetch(`${apiBase}/compliance/aml-alerts`),
    ]);
    setKyc((await kycRes.json()) as KycDocumentReview[]);
    setAlerts((await amlRes.json()) as AmlAlert[]);
  }

  useEffect(() => {
    void load();
  }, []);

  const prioritized = useMemo(
    () => [...alerts].sort((a, b) => severityScore[b.severity] - severityScore[a.severity]),
    [alerts],
  );

  const pendingKyc = kyc.filter((item) => item.status === "pending").length;
  const criticalAlerts = alerts.filter((item) => item.severity === "critical").length;

  return (
    <main className="container">
      <h1>ClearBank Compliance</h1>
      <p>Monitor KYC onboarding and AML risk events.</p>
      <div className="tabs">
        <button onClick={() => setScreen("queue")}>KYC Queue</button>
        <button onClick={() => setScreen("alerts")}>AML Alerts</button>
        <button onClick={() => setScreen("metrics")}>Risk Metrics</button>
      </div>

      {screen === "queue" && (
        <section className="card">
          <h2>KYC Review Queue</h2>
          {kyc.map((item) => (
            <p key={item.id}>
              {item.customerId} - {item.documentType} - <strong>{item.status}</strong>
            </p>
          ))}
        </section>
      )}

      {screen === "alerts" && (
        <section className="card">
          <h2>Prioritized AML Alerts</h2>
          {prioritized.map((item) => (
            <p key={item.id}>
              [{item.severity.toUpperCase()}] {item.reason} ({item.accountId})
            </p>
          ))}
        </section>
      )}

      {screen === "metrics" && (
        <section className="card">
          <h2>Operational Metrics</h2>
          <p>Pending KYC reviews: {pendingKyc}</p>
          <p>Total AML alerts: {alerts.length}</p>
          <p>Critical AML alerts: {criticalAlerts}</p>
        </section>
      )}
    </main>
  );
}
