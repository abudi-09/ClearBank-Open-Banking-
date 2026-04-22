"use client";

import { Button, Input } from "@clearbank/ui";
import { useState } from "react";

export default function SettingsPage() {
  const [companyName, setCompanyName] = useState("Acme Ltd");
  const [webhookUrl, setWebhookUrl] = useState("https://acme.dev/webhooks/clearbank");
  const [apiKey, setApiKey] = useState("cb_live_xxxxxxxxx");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <Input placeholder="Company info" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <Input placeholder="Webhook URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
        <div className="rounded border border-slate-200 bg-slate-50 p-2 text-sm">API Key: {apiKey}</div>
        <Button onClick={() => setApiKey(`cb_live_${crypto.randomUUID().replaceAll("-", "")}`)}>Regenerate API key</Button>
      </div>
    </div>
  );
}
