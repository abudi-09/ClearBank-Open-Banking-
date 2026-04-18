import { BudgetBar } from "../../components/BudgetBar";

const budgetRows = [
  { category: "Food", spent: 420, limit: 500, currency: "GBP" },
  { category: "Rent", spent: 1200, limit: 1300, currency: "GBP" },
  { category: "Transport", spent: 130, limit: 150, currency: "GBP" },
  { category: "Entertainment", spent: 270, limit: 300, currency: "GBP" },
];

export default function BudgetPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Monthly Budget</h1>
      <div className="space-y-3">
        {budgetRows.map((row) => (
          <BudgetBar key={row.category} {...row} />
        ))}
      </div>
    </div>
  );
}
