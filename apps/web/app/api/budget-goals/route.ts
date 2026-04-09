import { NextRequest, NextResponse } from "next/server";
import { getBudgetGoals, createBudgetGoal, listTransactionsByDateRange } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  try {
    const goals = await getBudgetGoals(session.email);

    // Calculate spent amount for current month per category
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const transactions = await listTransactionsByDateRange(session.email, startOfMonth, startOfNextMonth);

    const spentByCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.category) {
        spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount;
      }
    }

    const goalsWithSpent = goals.map((g) => {
      const spent = spentByCategory[g.category] ?? 0;
      return {
        ...g,
        spent,
        percentUsed: g.limitAmount > 0 ? (spent / g.limitAmount) * 100 : 0,
      };
    });

    return NextResponse.json(goalsWithSpent);
  } catch (error) {
    console.error("Budget goals fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch budget goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  try {
    const body = await request.json() as { category: string; limitAmount: number; period?: "monthly" | "weekly" | "yearly" };
    const goal = await createBudgetGoal(session.email, body.category, body.limitAmount, body.period ?? "monthly");
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Budget goal creation failed:", error);
    return NextResponse.json({ error: "Failed to create budget goal" }, { status: 500 });
  }
}
