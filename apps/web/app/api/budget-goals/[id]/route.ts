import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../../../../lib/auth";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api-budgetapp.ricardomboukou.online";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide." },
      { status: 401 }
    );
  }

  try {
    const url = new URL(`${API_URL}/budget-goals/${params.id}`);
    url.searchParams.set("userEmail", session.email);

    const response = await fetch(url, {
      method: "DELETE",
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Budget goal deletion failed:", error);
    return NextResponse.json(
      { error: "Failed to delete budget goal" },
      { status: 502 }
    );
  }
}
