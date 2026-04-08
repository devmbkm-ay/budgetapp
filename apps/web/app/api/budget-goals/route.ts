import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../../../lib/auth";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api-budgetapp.ricardomboukou.online";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide." },
      { status: 401 }
    );
  }

  try {
    const url = new URL(`${API_URL}/budget-goals`);
    url.searchParams.set("userEmail", session.email);

    const response = await fetch(url, {
      cache: "no-store",
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Budget goals fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget goals" },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/budget-goals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: session.email,
        category: body.category,
        limitAmount: body.limitAmount,
        period: body.period || "monthly",
      }),
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Budget goal creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create budget goal" },
      { status: 502 }
    );
  }
}
