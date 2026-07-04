import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfMonth },
      },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        insights: "💡 No transactions found for this month. Start adding your expenses to get AI insights!",
      });
    }

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    const categoryBreakdown: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryBreakdown[t.category] =
          (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const topCategory = Object.entries(categoryBreakdown).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Generate smart insights
    let insights = "📊 Monthly Financial Analysis\n\n";

    // Spending analysis
    if (savingsRate >= 30) {
      insights += `✅ Excellent! You're saving ${savingsRate.toFixed(0)}% of your income this month. Keep it up!\n\n`;
    } else if (savingsRate >= 10) {
      insights += `👍 Good job! You're saving ${savingsRate.toFixed(0)}% of your income. Try to push it to 30%.\n\n`;
    } else if (savingsRate > 0) {
      insights += `⚠️ You're only saving ${savingsRate.toFixed(0)}% of your income. Try to cut some expenses.\n\n`;
    } else {
      insights += `🚨 Warning! Your expenses (₹${totalExpenses.toFixed(0)}) exceed your income (₹${totalIncome.toFixed(0)}). Immediate action needed!\n\n`;
    }

    // Top spending category tip
    if (topCategory) {
      const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
      insights += `💸 Top Spending: Your highest expense is ${topCategory[0]} at ₹${topCategory[1].toFixed(0)} (${percentage}% of total expenses).\n\n`;

      // Category specific tips
      const tips: Record<string, string> = {
        Food: "🍽️ Tip: Try meal prepping at home to reduce food expenses by up to 40%.",
        Travel: "🚗 Tip: Consider carpooling or public transport to save on travel costs.",
        Shopping: "🛍️ Tip: Wait 24 hours before making non-essential purchases to avoid impulse buying.",
        Entertainment: "🎬 Tip: Look for free or discounted entertainment options in your city.",
        Medical: "💊 Tip: Consider getting health insurance to reduce medical expenses.",
        Education: "📚 Tip: Look for free online courses on YouTube or Coursera.",
        Rent: "🏠 Tip: Consider finding a roommate to split rent costs.",
      };

      if (tips[topCategory[0]]) {
        insights += tips[topCategory[0]] + "\n\n";
      }
    }

    // Saving suggestions
    insights += "💡 Saving Suggestions:\n";
    insights += "• Set aside 20% of income as savings on the day you receive it\n";
    insights += "• Review and cancel unused subscriptions\n";
    insights += "• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n\n";

    // Encouraging message
    if (balance > 0) {
      insights += `🌟 Great work! You have ₹${balance.toFixed(0)} left this month. Consider investing it for future growth!`;
    } else {
      insights += "🌟 Every financial journey starts with awareness. You're on the right track by tracking your expenses!";
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}