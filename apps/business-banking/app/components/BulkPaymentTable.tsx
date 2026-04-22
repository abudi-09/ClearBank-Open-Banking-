import type { BulkPaymentRow, InvalidRow } from "../../src/lib/csvParser";

export function BulkPaymentTable({ valid, invalid }: { valid: BulkPaymentRow[]; invalid: InvalidRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left">
          <tr>
            <th className="px-3 py-2">IBAN</th>
            <th className="px-3 py-2">Amount</th>
            <th className="px-3 py-2">Currency</th>
            <th className="px-3 py-2">Description</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {valid.map((row, idx) => (
            <tr key={`v-${idx}`} className="border-t">
              <td className="px-3 py-2">{row.recipient_iban}</td>
              <td className="px-3 py-2">{row.amount.toFixed(2)}</td>
              <td className="px-3 py-2">{row.currency}</td>
              <td className="px-3 py-2">{row.description}</td>
              <td className="px-3 py-2 text-emerald-700">VALID</td>
            </tr>
          ))}
          {invalid.map((row, idx) => (
            <tr key={`i-${idx}`} className="border-t bg-rose-50">
              <td className="px-3 py-2">{row.row.recipient_iban ?? "-"}</td>
              <td className="px-3 py-2">{row.row.amount ?? "-"}</td>
              <td className="px-3 py-2">{row.row.currency ?? "-"}</td>
              <td className="px-3 py-2">{row.row.description ?? "-"}</td>
              <td className="px-3 py-2 text-rose-700">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
