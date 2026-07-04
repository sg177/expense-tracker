import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-indigo-600">💰 Smart Expense Tracker</h1>
        <div className="flex gap-4">
          <a href="/sign-in" className="text-gray-600 hover:text-indigo-600 px-4 py-2">Login</a>
          <a href="/sign-up" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-8 py-20">
        <h2 className="text-5xl font-bold text-gray-800 mb-6">
          Track Your Money,<br />
          <span className="text-indigo-600">Build Your Future</span>
        </h2>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl">
          Smart Expense Tracker helps you manage income, track expenses,
          set budgets, and get AI-powered insights to improve your finances.
        </p>
        <div className="flex gap-4">
          <a href="/sign-up" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700">
            Start for Free →
          </a>
          <a href="/sign-in" className="bg-white text-indigo-600 px-8 py-4 rounded-xl text-lg font-semibold border border-indigo-600 hover:bg-indigo-50">
            Login
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-3 gap-6 px-8 pb-20 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Smart Analytics</h3>
          <p className="text-gray-500 text-sm">Visualize your spending with beautiful charts and graphs</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Budget Tracking</h3>
          <p className="text-gray-500 text-sm">Set monthly budgets and get warnings before you overspend</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
          <p className="text-gray-500 text-sm">Get personalized saving tips based on your spending patterns</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="text-lg font-semibold mb-2">Transaction Tracking</h3>
          <p className="text-gray-500 text-sm">Add, edit and delete income and expense transactions easily</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Secure Login</h3>
          <p className="text-gray-500 text-sm">Your data is protected with enterprise-grade authentication</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-lg font-semibold mb-2">Works Everywhere</h3>
          <p className="text-gray-500 text-sm">Access your finances from any device, anywhere, anytime</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-gray-400 text-sm border-t bg-white">
        © 2026 Smart Expense Tracker. Built with Next.js, Prisma & AI.
      </div>
    </div>
  );
}