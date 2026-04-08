import { NextRequest, NextResponse } from "next/server";
import { getBudgetAlerts } from "../../../../../packages/database/index";
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
    const alerts = await getBudgetAlerts(session.email);
    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Budget alerts fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch budget alerts" }, { status: 500 });
  }
}
