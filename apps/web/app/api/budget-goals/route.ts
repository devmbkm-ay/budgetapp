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

    const now = new Date();

    function getPeriodRange(period: string): { start: Date; end: Date } {
      switch (period) {
        case "weekly": {
          // Week starts on Monday
          const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
          const diffToMonday = (day === 0 ? -6 : 1 - day);
          const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday));
          const nextMonday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
          return { start: monday, end: nextMonday };
        }
        case "yearly": {
          const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
          const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
          return { start, end };
        }
        default: { // monthly
          const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
          const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
          return { start, end };
        }
      }
    }

    // Group goals by period to minimise DB queries (at most 3 queries)
    const periods = [...new Set(goals.map((g) => g.period))];
    const txByPeriod: Record<string, Awaited<ReturnType<typeof listTransactionsByDateRange>>> = {};
    await Promise.all(
      periods.map(async (period) => {
        const { start, end } = getPeriodRange(period);
        txByPeriod[period] = await listTransactionsByDateRange(session.email, start, end);
      }),
    );

    const goalsWithSpent = goals.map((g) => {
      const transactions = txByPeriod[g.period] ?? [];
      const spent = transactions
        .filter((tx) => tx.type === "expense" && tx.category === g.category)
        .reduce((sum, tx) => sum + tx.amount, 0);
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
