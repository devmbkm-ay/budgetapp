import { NextRequest, NextResponse } from "next/server";
import { getRecurringTransactions, createRecurringTransaction } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const items = await getRecurringTransactions(session.email);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "Failed to load recurring transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await req.json()) as {
      label: string;
      amount: number;
      currency?: string;
      category?: string;
      type: "expense" | "income";
      frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
      startDate: string;
      endDate?: string;
    };

    if (!body.label || !body.amount || !body.type || !body.frequency || !body.startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await createRecurringTransaction(session.email, body);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create recurring transaction" }, { status: 500 });
  }
}
