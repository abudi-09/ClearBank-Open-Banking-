import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TransactionDetailModal } from "@/components/TransactionDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MockTransaction } from "@/mocks/handlers";

export default function TransactionsPage() {
  const [iban, setIban] = useState("");
  const [reference, setReference] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<MockTransaction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (iban) p.set("iban", iban);
    if (reference) p.set("reference", reference);
    if (minAmount) p.set("minAmount", minAmount);
    if (maxAmount) p.set("maxAmount", maxAmount);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    return p.toString();
  }, [iban, reference, minAmount, maxAmount, from, to]);

  const { data: results = [], refetch, isFetching } = useQuery({
    queryKey: ["transactions", queryString],
    queryFn: async () => {
      const res = await fetch(`/transactions?${queryString}`);
      if (!res.ok) throw new Error("Failed to search");
      return (await res.json()) as MockTransaction[];
    },
  });

  function openDetail(tx: MockTransaction) {
    setSelected(tx);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transaction search</h1>
        <p className="text-sm text-muted-foreground">Filter by IBAN, reference, amounts, and dates.</p>
      </div>

      <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN fragment</Label>
          <Input id="iban" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="GB12…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ref">Reference #</Label>
          <Input id="ref" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="REF-" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minA">Min amount</Label>
          <Input id="minA" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxA">Max amount</Label>
          <Input id="maxA" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-from">From date</Label>
          <Input id="t-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t-to">To date</Label>
          <Input id="t-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="md:col-span-3">
          <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Searching…" : "Search"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                <TableCell>{tx.reference}</TableCell>
                <TableCell>
                  {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}{" "}
                  <span className="text-muted-foreground">{tx.currency}</span>
                </TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>{tx.status}</TableCell>
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <Button variant="link" className="px-0" onClick={() => openDetail(tx)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TransactionDetailModal
        tx={selected}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
