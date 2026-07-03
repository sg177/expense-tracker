"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Food", "Travel", "Shopping", "Rent", "Education",
  "Medical", "Entertainment", "Other",
];

interface Budget {
  id: string;
  category: string;
  amount: number;
}

interface Transaction {
  type: string;
  amount: number;
  category: string;
}

interface Props {
  budgets: Budget[];
  transactions: Transaction[];
}

export default function BudgetTracker({ budgets, transactions }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Calculate spending per category this month
  const spendingByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      spendingByCategory[t.category] =
        (spendingByCategory[t.category] || 0) + t.amount;
    });

  const handleSave = async () => {
    if (!amount) return;
    setSaving(true);
    try {
      await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          month,
          year,
        }),
      });
      setAmount("");
      router.refresh();
    } catch (error) {
      alert("Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Set Budget Form */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">Set Monthly Budget</h2>
        <div className="flex gap-3">
          <select
            className="border rounded p-2 flex-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount ₹"
            className="border rounded p-2 flex-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {saving ? "Saving..." : "Set Budget"}
          </button>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">
          Budget Progress — {now.toLocaleString("default", { month: "long" })} {year}
        </h2>
        {budgets.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No budgets set yet. Add one above!
          </p>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = spendingByCategory[budget.category] || 0;
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              const isWarning = percentage >= 80;
              const isOver = spent > budget.amount;

              return (
                <div key={budget.id}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{budget.category}</span>
                    <span
                      className={
                        isOver
                          ? "text-red-600 font-bold"
                          : isWarning
                          ? "text-orange-500 font-bold"
                          : "text-gray-600"
                      }
                    >
                      ₹{spent.toFixed(0)} / ₹{budget.amount.toFixed(0)}
                      {isOver && " ⚠️ Over budget!"}
                      {!isOver && isWarning && " ⚠️ Almost there!"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isOver
                          ? "bg-red-500"
                          : isWarning
                          ? "bg-orange-400"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}