"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
];

interface Transaction {
  type: string;
  amount: number;
  category: string;
  date: Date | string;
}

interface Props {
  transactions: Transaction[];
}

export default function AnalyticsCharts({ transactions }: Props) {
  // Monthly data for bar chart
  const monthlyData: Record<string, { month: string; income: number; expenses: number }> = {};

  transactions.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthName = date.toLocaleString("default", { month: "short", year: "numeric" });

    if (!monthlyData[key]) {
      monthlyData[key] = { month: monthName, income: 0, expenses: 0 };
    }

    if (t.type === "income") {
      monthlyData[key].income += t.amount;
    } else {
      monthlyData[key].expenses += t.amount;
    }
  });

  const barData = Object.values(monthlyData).slice(-6);

  // Category breakdown for pie chart
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  // Summary stats
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = transactions.length;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">₹{totalIncome.toFixed(0)}</p>
        </div>
        <div className="bg-red-100 rounded-xl p-4">
          <p className="text-sm text-red-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">₹{totalExpenses.toFixed(0)}</p>
        </div>
        <div className="bg-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-700">{totalTransactions}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h2>
        {barData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Chart */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
        {pieData.length === 0 ? (
          <p className="text-gray-400 text-sm">No expense data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
        {pieData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data available yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Category</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {pieData
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">₹{item.value.toFixed(0)}</td>
                    <td className="py-2">
                      {((item.value / totalExpenses) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}