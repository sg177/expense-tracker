"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
];

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
}

interface Props {
  transactions: Transaction[];
}

export default function ExpenseChart({ transactions }: Props) {
  // Group expenses by category
  const expenses = transactions.filter((t) => t.type === "expense");

  const categoryMap: Record<string, number> = {};
  expenses.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  if (data.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-8">
        No expense data yet to show chart.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}