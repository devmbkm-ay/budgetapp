import { NextRequest, NextResponse } from "next/server";
import { getBudgetGoals, createBudgetGoal } from "../../../../../packages/database/index";
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
    return NextResponse.json(goals);
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
