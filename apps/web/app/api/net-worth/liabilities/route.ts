import { NextRequest, NextResponse } from "next/server";
import { createLiability } from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json() as { label: string; balance: number; type: string; note?: string };
  if (!body.label || body.balance == null || !body.type) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const liability = await createLiability({ ...body, userEmail: session.email });
  return NextResponse.json(liability, { status: 201 });
}
