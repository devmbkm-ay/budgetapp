import { NextRequest, NextResponse } from "next/server";
import { listTransactionsByDateRange } from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export interface MonthData {
  month: string;  // "2025-11"
  label: string;  // "Nov"
  income: number;
  expenses: number;
  balance: number;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    // 6 months window: from start of (current month - 5) to start of next month
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const transactions = await listTransactionsByDateRange(session.email, start, end);

    // Aggregate by month
    const byMonth: Record<string, { income: number; expenses: number }> = {};
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!byMonth[key]) byMonth[key] = { income: 0, expenses: 0 };
      if (t.type === "income") byMonth[key]!.income += t.amount;
      else byMonth[key]!.expenses += t.amount;
    }

    // Build the ordered 6-month array, filling gaps with zeros
    const months: MonthData[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const raw = d.toLocaleDateString("fr-FR", { month: "short" });
      const label = raw.charAt(0).toUpperCase() + raw.slice(1).replace(".", "");
      const income = byMonth[key]?.income ?? 0;
      const expenses = byMonth[key]?.expenses ?? 0;
      return { month: key, label, income, expenses, balance: income - expenses };
    });

    return NextResponse.json({ months });
  } catch (err) {
    console.error("[insights/monthly]", err);
    return NextResponse.json({ error: "Failed to load monthly data" }, { status: 500 });
  }
}
