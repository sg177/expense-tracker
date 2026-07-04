import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionList from "@/components/transactions/TransactionList";
import ExpenseChart from "@/components/charts/ExpenseChart";
import BudgetTracker from "@/components/budget/BudgetTracker";
import AIInsights from "@/components/ai/AIInsights";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    await prisma.user.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        imageUrl: user.imageUrl ?? "",
      },
    });
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: dbUser?.id ?? "" },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const budgets = await prisma.budget.findMany({
    where: {
      userId: dbUser?.id ?? "",
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          Welcome, {user.firstName ?? "User"} 👋
        </h1>
        <div className="flex items-center gap-4">
          <a href="/analytics" className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
            📊 Analytics
          </a>
          <a href="/admin" className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">
            🛡️ Admin
          </a>
          <UserButton />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 rounded-xl p-4">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">₹{income.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 rounded-xl p-4">
          <p className="text-sm text-red-600">Total Expenses</p>
          <p className="text-2xl font-bold text-red-700">₹{expenses.toFixed(2)}</p>
        </div>
        <div className="bg-blue-100 rounded-xl p-4">
          <p className="text-sm text-blue-600">Balance</p>
          <p className="text-2xl font-bold text-blue-700">₹{(income - expenses).toFixed(2)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Spending by Category</h2>
        <ExpenseChart transactions={transactions} />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-8">
        {/* Add Transaction Form */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
          <TransactionForm />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <TransactionList transactions={transactions} />
        </div>
      </div>

      {/* Budget */}
      <div className="mt-8">
        <BudgetTracker
          budgets={budgets}
          transactions={transactions}
        />
      </div>
      {/* AI Insights */}
      <AIInsights />
    </div>
  );
}