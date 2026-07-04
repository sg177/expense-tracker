import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalyticsCharts from "@/components/charts/AnalyticsCharts";

export default async function AnalyticsPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) redirect("/dashboard");

  const transactions = await prisma.transaction.findMany({
    where: { userId: dbUser.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">📊 Analytics</h1>
        <a href="/dashboard" className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">← Back to Dashboard</a>
      </div>
      <AnalyticsCharts transactions={transactions} />
    </div>
  );
}