export function BudgetBar(props: { category: string; spent: number; limit: number; currency: string }) {
  const { category, spent, limit, currency } = props;
  const percent = Math.min((spent / limit) * 100, 100);
  const isHot = percent > 90;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{category}</span>
        <span className="text-slate-500">
          {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(spent)} /{" "}
          {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(limit)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200">
        <div
          className={`h-2 rounded-full ${isHot ? "bg-rose-500" : "bg-emerald-500"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
