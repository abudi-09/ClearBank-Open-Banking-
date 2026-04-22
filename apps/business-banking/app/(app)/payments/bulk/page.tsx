"use client";

import { useState } from "react";
import { Button } from "@clearbank/ui";
import { BulkPaymentTable } from "../../../components/BulkPaymentTable";
import { parsePaymentCSV, type BulkPaymentRow, type InvalidRow } from "../../../../src/lib/csvParser";

export default function BulkPaymentsPage() {
  const [step, setStep] = useState(1);
  const [raw, setRaw] = useState("recipient_iban,amount,currency,description\nGB12CLRB12345678901234,250.50,GBP,Supplier A");
  const [valid, setValid] = useState<BulkPaymentRow[]>([]);
  const [invalid, setInvalid] = useState<InvalidRow[]>([]);

  function parseNow() {
    const parsed = parsePaymentCSV(raw);
    setValid(parsed.valid);
    setInvalid(parsed.invalid);
    setStep(2);
  }

  function upload(file: File) {
    file.text().then((text) => setRaw(text));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Bulk Payments</h1>
      {step === 1 && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">Step 1: Paste CSV or upload file</p>
          <textarea className="h-48 w-full rounded border p-2 font-mono text-sm" value={raw} onChange={(e) => setRaw(e.target.value)} />
          <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <Button onClick={parseNow}>Parse CSV</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Step 2: Preview parsed rows (invalid rows in red)</p>
          <BulkPaymentTable valid={valid} invalid={invalid} />
          <div className="flex gap-2">
            <Button onClick={() => setStep(1)} className="bg-slate-700 hover:bg-slate-800">Back</Button>
            <Button onClick={() => setStep(3)} disabled={valid.length === 0}>Confirm valid rows</Button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm">Step 3: Submit {valid.length} valid rows</p>
          <Button onClick={() => alert(`Submitted ${valid.length} bulk payments.`)}>Submit All Valid</Button>
        </div>
      )}
    </div>
  );
}
