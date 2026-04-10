import { NextRequest, NextResponse } from "next/server";
import {
  getAssets,
  getLiabilities,
  saveNetWorthSnapshot,
  getNetWorthHistory,
} from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const [assets, liabilities, history] = await Promise.all([
    getAssets(session.email),
    getLiabilities(session.email),
    getNetWorthHistory(session.email, 12),
  ]);

  const totalAssets = assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  // Fire-and-forget daily snapshot
  void saveNetWorthSnapshot(session.email).catch(() => null);

  return NextResponse.json({ assets, liabilities, totalAssets, totalLiabilities, netWorth, history });
}
