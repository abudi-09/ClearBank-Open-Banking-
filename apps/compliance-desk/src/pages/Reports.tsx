import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function downloadCsv(path: string, filename: string, body: object) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [busy, setBusy] = useState<null | "sar" | "aml">(null);
  const [error, setError] = useState("");

  async function run(kind: "sar" | "aml") {
    setBusy(kind);
    setError("");
    try {
      if (kind === "sar") {
        await downloadCsv("/reports/sar", "sar-report.csv", { start, end });
      } else {
        await downloadCsv("/reports/aml-summary", "aml-summary.csv", { start, end });
      }
    } catch {
      setError("Could not generate report.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance reports</h1>
        <p className="text-sm text-muted-foreground">Generate mock CSV exports for the selected period.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Report period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rep-start">Start date</Label>
              <Input id="rep-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rep-end">End date</Label>
              <Input id="rep-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" disabled={busy !== null} onClick={() => void run("sar")}>
              {busy === "sar" ? "Generating…" : "Generate SAR Report"}
            </Button>
            <Button type="button" variant="secondary" disabled={busy !== null} onClick={() => void run("aml")}>
              {busy === "aml" ? "Generating…" : "Generate AML Summary"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
