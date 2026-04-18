import { Badge } from "@clearbank/ui";

const iconByType: Record<string, string> = {
  DEBIT: "⬇",
  CREDIT: "⬆",
  TRANSFER: "↔",
  FX: "¤",
};

export function TransactionRow(props: {
  type: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}) {
  const { type, description, amount, currency, date, status } = props;
  const positive = type === "CREDIT";

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{iconByType[type] ?? "•"}</span>
        <div>
          <p className="text-sm font-medium">{description}</p>
          <p className="text-xs text-slate-500">{new Date(date).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
          {positive ? "+" : "-"}
          {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount)}
        </p>
        <Badge>{status}</Badge>
      </div>
    </div>
  );
}
