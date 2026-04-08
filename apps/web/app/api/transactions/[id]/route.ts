import { NextRequest, NextResponse } from "next/server";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const transaction = await getTransactionById(id, session.email);
    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to load transaction:", error);
    return NextResponse.json({ error: "Transaction introuvable." }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json() as {
      label: string;
      amount: number;
      type: "expense" | "income";
      category?: string | null;
      currency?: string;
      date?: string;
    };

    const transaction = await updateTransaction({
      ...body,
      transactionId: id,
      userEmail: session.email,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json({ error: "Impossible de modifier la transaction." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const { id } = await params;
    await deleteTransaction(id, session.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json({ error: "Impossible de supprimer la transaction." }, { status: 500 });
  }
}
