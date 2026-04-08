import { NextRequest, NextResponse } from "next/server";
import { listTransactionsByDateRange } from "../../../../../../packages/database/index";
import { buildMonthlyInsights } from "../../../../../../lib/finance-intelligence";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

function getCurrentMonthRange(now = new Date()) {
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { startDate, endDate };
}

function getPreviousMonthRange(now = new Date()) {
  const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return { startDate, endDate };
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();
    const [currentTransactions, previousTransactions] = await Promise.all([
      listTransactionsByDateRange(session.email, currentMonth.startDate, currentMonth.endDate),
      listTransactionsByDateRange(session.email, previousMonth.startDate, previousMonth.endDate),
    ]);

    const insights = buildMonthlyInsights(currentTransactions, previousTransactions);
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Failed to load insights:", error);
    return NextResponse.json({ error: "Impossible de charger les insights." }, { status: 500 });
  }
}
