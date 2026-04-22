"use client";

import { useMemo, useState } from "react";
import { Button, Input } from "@clearbank/ui";

type Line = { description: string; amount: number };

export function InvoiceBuilder() {
  const [clientName, setClientName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [vat, setVat] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ description: "", amount: 0 }]);

  const subtotal = useMemo(() => lines.reduce((acc, line) => acc + line.amount, 0), [lines]);
  const total = useMemo(() => (vat ? subtotal * 1.2 : subtotal), [subtotal, vat]);

  function updateLine(index: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  }

  function save() {
    localStorage.setItem(
      "bb_invoice_draft",
      JSON.stringify({ clientName, dueDate, vat, lines, total }),
    );
    alert("Invoice saved.");
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
      <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} /> Apply VAT (20%)
      </label>
      {lines.map((line, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Description"
            value={line.description}
            onChange={(e) => updateLine(idx, { description: e.target.value })}
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={line.amount}
            onChange={(e) => updateLine(idx, { amount: Number(e.target.value) })}
          />
        </div>
      ))}
      <Button onClick={() => setLines((prev) => [...prev, { description: "", amount: 0 }])}>Add line item</Button>
      <p className="font-semibold">Total: £{total.toFixed(2)}</p>
      <div className="flex gap-2">
        <Button onClick={save}>Save Invoice</Button>
        <Button onClick={() => alert("PDF generation placeholder")} className="bg-slate-700 hover:bg-slate-800">
          Download PDF
        </Button>
      </div>
    </div>
  );
}
