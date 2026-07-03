import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { category, amount, month, year } = body;

    if (!category || !amount || !month || !year) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update if exists, create if not
    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: user.id,
          category,
          month,
          year,
        },
      },
      update: { amount },
      create: {
        userId: user.id,
        category,
        amount,
        month,
        year,
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
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
    const budgets = await prisma.budget.findMany({
      where: {
        userId: user.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}