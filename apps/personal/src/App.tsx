import { useEffect, useMemo, useState } from "react";
import type { Budget, SavingsGoal } from "@clearbank/types";

const apiBase = import.meta.env.VITE_CLEARBANK_API_URL ?? "http://localhost:4000";

type Screen = "overview" | "budgets" | "goals";

export function App() {
  const [screen, setScreen] = useState<Screen>("overview");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [goalName, setGoalName] = useState("Holiday");
  const [goalTarget, setGoalTarget] = useState("1200.00");

  async function load() {
    const [budgetRes, goalRes] = await Promise.all([
      fetch(`${apiBase}/personal/budgets`),
      fetch(`${apiBase}/personal/goals`),
    ]);
    setBudgets((await budgetRes.json()) as Budget[]);
    setGoals((await goalRes.json()) as SavingsGoal[]);
  }

  async function createGoal() {
    const payload: SavingsGoal = {
      id: crypto.randomUUID(),
      userId: "user-alice",
      name: goalName,
      targetAmount: { amount: goalTarget, currency: "GBP" },
      currentAmount: { amount: "0.00", currency: "GBP" },
    };
    await fetch(`${apiBase}/personal/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  const totalBudget = useMemo(
    () => budgets.reduce((acc, item) => acc + Number(item.monthlyLimit.amount), 0),
    [budgets],
  );

  return (
    <main className="container">
      <h1>ClearBank Personal</h1>
      <p>Track monthly budgets and savings goals.</p>
      <div className="tabs">
        <button onClick={() => setScreen("overview")}>Overview</button>
        <button onClick={() => setScreen("budgets")}>Budgets</button>
        <button onClick={() => setScreen("goals")}>Goals</button>
      </div>

      {screen === "overview" && (
        <section className="card">
          <h2>Snapshot</h2>
          <p>Budget categories: {budgets.length}</p>
          <p>Total monthly budget: GBP {totalBudget.toFixed(2)}</p>
          <p>Savings goals: {goals.length}</p>
        </section>
      )}

      {screen === "budgets" && (
        <section className="card">
          <h2>Budgets</h2>
          {budgets.map((budget) => (
            <p key={budget.id}>
              {budget.category}: {budget.monthlyLimit.amount} {budget.monthlyLimit.currency}
            </p>
          ))}
        </section>
      )}

      {screen === "goals" && (
        <section className="card">
          <h2>Savings Goals</h2>
          <div className="row">
            <input value={goalName} onChange={(event) => setGoalName(event.target.value)} />
            <input value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} />
            <button onClick={() => void createGoal()}>Add Goal</button>
          </div>
          {goals.map((goal) => (
            <p key={goal.id}>
              {goal.name}: {goal.currentAmount.amount}/{goal.targetAmount.amount} {goal.targetAmount.currency}
            </p>
          ))}
        </section>
      )}
    </main>
  );
}
