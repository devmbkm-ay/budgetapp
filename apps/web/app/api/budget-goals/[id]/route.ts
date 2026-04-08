import { NextRequest, NextResponse } from "next/server";
import { deleteBudgetGoal } from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json({ error: "Session invalide." }, { status: 401 });
  }

  try {
    await deleteBudgetGoal(id, session.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Budget goal deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete budget goal" }, { status: 500 });
  }
}
