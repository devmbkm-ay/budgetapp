import { NextRequest, NextResponse } from "next/server";
import { createTransaction, listTransactions } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const transactions = await listTransactions(session.email);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to load transactions:", error);
    return NextResponse.json({ error: "Impossible de charger les transactions." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json() as {
      label: string;
      amount: number;
      type: "expense" | "income";
      category?: string | null;
      currency?: string;
      date?: string;
    };

    const transaction = await createTransaction({
      ...body,
      userEmail: session.email,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json({ error: "Impossible de créer la transaction." }, { status: 500 });
  }
}
