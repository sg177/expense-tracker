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

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
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
    where: { userId: dbUser.id },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const budgets = await prisma.budget.findMany({
    where: {
      userId: dbUser.id,
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

  const balance = income - expenses;
  // const isAdmin = user.id === process.env.ADMIN_USER_ID;

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="p-8">
        {/* Welcome */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome back, {user.firstName ?? "User"} 👋
        </h2>

        {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">₹{income.toFixed(0)}</p>
          <p className="text-xs text-green-500 mt-1">↑ All time</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">₹{expenses.toFixed(0)}</p>
          <p className="text-xs text-red-500 mt-1">↓ All time</p>
        </div>
        <div className={`bg-white rounded-xl p-5 shadow border-l-4 ${balance >= 0 ? "border-blue-500" : "border-orange-500"}`}>
          <p className="text-sm text-gray-500">Balance</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">₹{balance.toFixed(0)}</p>
          <p className={`text-xs mt-1 ${balance >= 0 ? "text-blue-500" : "text-orange-500"}`}>
            {balance >= 0 ? "↑ Positive" : "↓ Negative"}
          </p>
        </div>
      </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-6 shadow mb-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Spending by Category</h2>
          <ExpenseChart transactions={transactions} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Add Transaction</h2>
            <TransactionForm />
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Recent Transactions
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({transactions.length} total)
              </span>
            </h2>
            <TransactionList transactions={transactions} />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-8">
          <BudgetTracker budgets={budgets} transactions={transactions} />
        </div>

        {/* AI Insights */}
        <AIInsights />
      </div>

      {/* Footer */}
      <div className="text-center py-4 text-gray-400 text-sm border-t bg-white mt-8">
        © 2026 Smart Expense Tracker — Built with Next.js, Prisma & AI
      </div>
    </div>
  );
}