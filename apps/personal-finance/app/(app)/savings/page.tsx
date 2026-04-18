import { Card } from "@clearbank/ui";

const goals = [
  { name: "Emergency Fund", target: 10000, current: 4200, deadline: "2026-12-31" },
  { name: "Vacation", target: 3500, current: 1400, deadline: "2026-08-15" },
];

export default function SavingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Savings Goals</h1>
      {goals.map((goal) => {
        const progress = Math.min((goal.current / goal.target) * 100, 100);
        return (
          <Card key={goal.name}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{goal.name}</p>
                <p className="text-sm text-slate-500">Deadline: {goal.deadline}</p>
              </div>
              <p className="text-sm text-slate-600">
                £{goal.current.toLocaleString()} / £{goal.target.toLocaleString()}
              </p>
              <div className="h-2 rounded-full bg-slate-200">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
