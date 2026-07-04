import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const user = await currentUser();

  // Not logged in
  if (!user) redirect("/sign-in");

  // Not admin
  if (user.id !== process.env.ADMIN_USER_ID) {
    redirect("/dashboard");
  }

  // Get all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  // Platform stats
  const totalUsers = users.length;
  const totalTransactions = transactions.length;
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
          <p className="text-gray-500 text-sm">Only visible to you</p>
        </div>
        <a href="/dashboard" className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">← Back to Dashboard</a>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold text-indigo-600">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-600">{totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Platform Income</p>
          <p className="text-2xl font-bold text-green-600">₹{totalIncome.toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow">
          <p className="text-sm text-gray-500">Platform Expenses</p>
          <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toFixed(0)}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">All Users ({totalUsers})</h2>
        {users.length === 0 ? (
          <p className="text-gray-400 text-sm">No users yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{u.firstName} {u.lastName}</td>
                  <td className="py-2 text-gray-500">{u.email}</td>
                  <td className="py-2 text-gray-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold mb-4">All Transactions ({totalTransactions})</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-400 text-sm">No transactions yet.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">User</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="py-2 text-sm">{(t as any).user?.email}</td>                  <td className="py-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${t.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 text-sm">{t.category}</td>
                  <td className={`py-2 font-semibold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    ₹{t.amount.toFixed(0)}
                  </td>
                  <td className="py-2 text-gray-400 text-sm">
                    {new Date(t.date).toLocaleDateString()}
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