import { NextRequest, NextResponse } from "next/server";
import { getSavingsGoals, createSavingsGoal } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  const goals = await getSavingsGoals(session.email);
  return NextResponse.json(goals);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json() as {
    label: string; targetAmount: number; currentAmount?: number;
    targetDate?: string | null; emoji?: string | null;
  };
  if (!body.label || !body.targetAmount) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const goal = await createSavingsGoal({ ...body, userEmail: session.email });
  return NextResponse.json(goal, { status: 201 });
}
