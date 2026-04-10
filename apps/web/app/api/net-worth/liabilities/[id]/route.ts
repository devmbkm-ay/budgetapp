import { NextRequest, NextResponse } from "next/server";
import { updateLiability, deleteLiability } from "../../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { label?: string; balance?: number; type?: string; note?: string | null };
  const updated = await updateLiability(id, session.email, body);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  await deleteLiability(id, session.email);
  return NextResponse.json({ success: true });
}
