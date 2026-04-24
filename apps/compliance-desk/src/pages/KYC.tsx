import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { KYCReviewPanel } from "@/components/KYCReviewPanel";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { KYCCase as KYCCaseRow } from "@/mocks/handlers";
import { AUTH_TOKEN_KEY } from "@/lib/auth";

function statusBadge(status: KYCCaseRow["status"]) {
  if (status === "VERIFIED") return <Badge variant="success">VERIFIED</Badge>;
  if (status === "REJECTED") return <Badge variant="destructive">REJECTED</Badge>;
  return <Badge variant="warning">PENDING</Badge>;
}

export default function KYCPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<KYCCaseRow | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: queue = [], isLoading } = useQuery({
    queryKey: ["kyc-queue"],
    queryFn: async () => {
      const res = await fetch("/compliance/queue");
      if (!res.ok) throw new Error("Failed to load queue");
      return (await res.json()) as KYCCaseRow[];
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (payload: { id: string; status: "VERIFIED" | "REJECTED"; notes: string }) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await fetch(`/compliance/kyc/${payload.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: payload.status, notes: payload.notes }),
      });
      if (!res.ok) throw new Error("Update failed");
      return (await res.json()) as KYCCaseRow;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["kyc-queue"] });
      setPanelOpen(false);
      setSelected(null);
      setNotes("");
    },
  });

  function openRow(row: KYCCaseRow) {
    setSelected(row);
    setNotes("");
    setPanelOpen(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">KYC review queue</h1>
        <p className="text-sm text-muted-foreground">Click a row to open the review panel.</p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User name</TableHead>
              <TableHead>Document type</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : null}
            {queue.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => openRow(row)}
                data-state={selected?.id === row.id ? "selected" : undefined}
              >
                <TableCell>{row.userName}</TableCell>
                <TableCell className="uppercase">{row.docType.replaceAll("_", " ")}</TableCell>
                <TableCell>{new Date(row.submittedAt).toLocaleString()}</TableCell>
                <TableCell>{statusBadge(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <KYCReviewPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        caseItem={selected}
        notes={notes}
        onNotesChange={setNotes}
        submitting={patchMutation.isPending}
        onApprove={() => selected && patchMutation.mutate({ id: selected.id, status: "VERIFIED", notes })}
        onReject={() => selected && patchMutation.mutate({ id: selected.id, status: "REJECTED", notes })}
      />
    </div>
  );
}
