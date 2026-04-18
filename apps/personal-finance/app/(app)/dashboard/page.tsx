import { Card } from "@clearbank/ui";
import { SpendingChart } from "../../components/SpendingChart";
import { TransactionRow } from "../../components/TransactionRow";

const tx = [
  { type: "DEBIT", description: "Groceries", amount: 95.5, currency: "GBP", date: new Date().toISOString(), status: "COMPLETED" },
  { type: "CREDIT", description: "Salary", amount: 2500, currency: "GBP", date: new Date().toISOString(), status: "COMPLETED" },
  { type: "DEBIT", description: "Transport", amount: 18.75, currency: "GBP", date: new Date().toISOString(), status: "COMPLETED" },
  { type: "DEBIT", description: "Utilities", amount: 120, currency: "GBP", date: new Date().toISOString(), status: "COMPLETED" },
  { type: "DEBIT", description: "Dining", amount: 44.2, currency: "GBP", date: new Date().toISOString(), status: "PENDING" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <p className="text-sm text-slate-500">Net Worth</p>
        <p className="text-3xl font-bold">£21,430.70</p>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Recent Transactions</h2>
        <div className="space-y-2">
          {tx.map((item, idx) => (
            <TransactionRow key={`${item.description}-${idx}`} {...item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Spending by Category</h2>
        <SpendingChart
          data={[
            { category: "Food", value: 420 },
            { category: "Rent", value: 1200 },
            { category: "Transport", value: 130 },
            { category: "Entertainment", value: 190 },
          ]}
        />
      </section>
    </div>
  );
}
