import { NextRequest, NextResponse } from "next/server";
import { toggleRecurringTransaction, deleteRecurringTransaction } from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await toggleRecurringTransaction(id, session.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to toggle recurring transaction" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    await deleteRecurringTransaction(id, session.email);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete recurring transaction" }, { status: 500 });
  }
}
