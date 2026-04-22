import { Card } from "@clearbank/ui";
import { CashFlowChart } from "../../components/CashFlowChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total Balance</p>
          <p className="text-2xl font-bold">£185,420.19</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Pending Payments</p>
          <p className="text-2xl font-bold">14</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">30d Net Flow</p>
          <p className="text-2xl font-bold text-emerald-600">+£22,810.00</p>
        </Card>
      </div>
      <CashFlowChart
        data={[
          { week: "W1", income: 24000, expenses: 19000 },
          { week: "W2", income: 28000, expenses: 21000 },
          { week: "W3", income: 25000, expenses: 18000 },
          { week: "W4", income: 30000, expenses: 22000 },
        ]}
      />
    </div>
  );
}
