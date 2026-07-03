"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Food", "Travel", "Shopping", "Rent", "Education",
  "Medical", "Entertainment", "Salary", "Freelance", "Other",
];

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date | string;
}

interface Props {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});
  const [saving, setSaving] = useState(false);

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

  const handleEditStart = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm({
      type: t.type,
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: new Date(t.date).toISOString().split("T")[0],
    });
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/transactions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...editForm }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert("Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <p className="text-gray-400 text-sm">No transactions yet. Add one!</p>
    );
  }

  return (
    <ul className="space-y-3">
      {transactions.map((t) => (
        <li key={t.id} className="border-b pb-3">
          {editingId === t.id ? (
            // Edit Form
            <div className="space-y-2">
              <div className="flex gap-2">
                <select
                  className="border rounded p-1 text-sm flex-1"
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="number"
                  className="border rounded p-1 text-sm flex-1"
                  value={editForm.amount ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="border rounded p-1 text-sm flex-1"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="border rounded p-1 text-sm flex-1"
                  value={editForm.date as string}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <input
                type="text"
                className="border rounded p-1 text-sm w-full"
                placeholder="Description"
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSave}
                  disabled={saving}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="bg-gray-200 px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Normal View
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{t.category}</p>
                <p className="text-sm text-gray-400">{t.description}</p>
                <p className="text-xs text-gray-300">
                  {new Date(t.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className={t.type === "income" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {t.type === "income" ? "+" : "-"}₹{t.amount.toFixed(2)}
                </p>
                <button
                  onClick={() => handleEditStart(t)}
                  className="text-blue-400 hover:text-blue-600 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50"
                >
                  {deletingId === t.id ? "..." : "✕"}
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}