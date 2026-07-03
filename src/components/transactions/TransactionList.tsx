"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      router.refresh();
    } catch (error) {
      alert("Failed to delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <p className="text-gray-400 text-sm">
        No transactions yet. Add one!
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {transactions.map((t) => (
        <li
          key={t.id}
          className="flex justify-between items-center border-b pb-2"
        >
          <div>
            <p className="font-medium">{t.category}</p>
            <p className="text-sm text-gray-400">{t.description}</p>
            <p className="text-xs text-gray-300">
              {new Date(t.date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p
              className={
                t.type === "income"
                  ? "text-green-600 font-bold"
                  : "text-red-600 font-bold"
              }
            >
              {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
            </p>
            <button
              onClick={() => handleDelete(t.id)}
              disabled={deletingId === t.id}
              className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50"
            >
              {deletingId === t.id ? "..." : "✕"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}