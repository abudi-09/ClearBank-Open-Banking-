"use client";

import { Pie, PieChart, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const colors = ["#2563eb", "#0891b2", "#7c3aed", "#16a34a", "#f59e0b"];

export function SpendingChart(props: { data: Array<{ category: string; value: number }> }) {
  const { data } = props;
  return (
    <div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="category" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
