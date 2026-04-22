"use client";

const rows = [
  { date: "2026-05-01", type: "DEBIT", amount: 5000, desc: "Supplier A", status: "COMPLETED" },
  { date: "2026-05-03", type: "CREDIT", amount: 9200, desc: "Client Invoice #1002", status: "COMPLETED" },
];

function toCsv() {
  const header = "date,type,amount,description,status";
  const body = rows.map((r) => `${r.date},${r.type},${r.amount},${r.desc},${r.status}`).join("\n");
  return `${header}\n${body}`;
}

export default function AccountDetailPage() {
  function exportCsv() {
    const blob = new Blob([toCsv()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transaction History</h1>
        <button onClick={exportCsv} className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{r.date}</td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">£{r.amount.toFixed(2)}</td>
                <td className="px-3 py-2">{r.desc}</td>
                <td className="px-3 py-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
