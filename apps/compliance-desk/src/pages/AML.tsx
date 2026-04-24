import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AMLAlertRow } from "@/components/AMLAlertRow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AMLAlert } from "@/mocks/handlers";

export default function AMLPage() {
  const qc = useQueryClient();
  const [minRisk, setMinRisk] = useState([0]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reviewedFilter, setReviewedFilter] = useState<"all" | "reviewed" | "unreviewed">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("minRisk", String(minRisk[0]));
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (reviewedFilter !== "all") p.set("reviewed", reviewedFilter === "reviewed" ? "reviewed" : "unreviewed");
    return p.toString();
  }, [from, minRisk, reviewedFilter, to]);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["aml-alerts", queryParams],
    queryFn: async () => {
      const res = await fetch(`/compliance/aml-alerts?${queryParams}`);
      if (!res.ok) throw new Error("Failed to load AML alerts");
      return (await res.json()) as AMLAlert[];
    },
  });

  const markMutation = useMutation({
    mutationFn: async (id: string) => {
      setBusyId(id);
      const res = await fetch(`/compliance/aml-alerts/${id}/reviewed`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark reviewed");
      return (await res.json()) as AMLAlert;
    },
    onSettled: () => setBusyId(null),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["aml-alerts"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AML alerts</h1>
        <p className="text-sm text-muted-foreground">Risk score legend: 0–30 low, 31–70 medium, 71–100 high.</p>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-4">
        <div className="md:col-span-2 space-y-2">
          <Label>Minimum risk score ({minRisk[0]})</Label>
          <Slider value={minRisk} max={100} step={1} onValueChange={setMinRisk} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aml-from">Date from</Label>
          <Input id="aml-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aml-to">Date to</Label>
          <Input id="aml-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="md:col-span-4 space-y-2">
          <Label>Reviewed</Label>
          <Select value={reviewedFilter} onValueChange={(v) => setReviewedFilter(v as typeof reviewedFilter)}>
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unreviewed">Unreviewed only</SelectItem>
              <SelectItem value="reviewed">Reviewed only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Reviewed</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : null}
            {alerts.map((alert) => (
              <AMLAlertRow
                key={alert.id}
                alert={alert}
                busy={busyId === alert.id}
                onMarkReviewed={(id) => markMutation.mutate(id)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
