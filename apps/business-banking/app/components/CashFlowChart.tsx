"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CashFlowChart({ data }: { data: Array<{ week: string; income: number; expenses: number }> }) {
  return (
    <div className="h-72 rounded-xl border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#16a34a" />
          <Bar dataKey="expenses" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
