import { NextRequest, NextResponse } from "next/server";
import { createAsset } from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json() as { label: string; value: number; type: string; note?: string };
  if (!body.label || body.value == null || !body.type) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }

  const asset = await createAsset({ ...body, userEmail: session.email });
  return NextResponse.json(asset, { status: 201 });
}
