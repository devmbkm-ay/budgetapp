import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../../../../lib/auth";

function getApiUrl(): string {
  const url = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://api-budgetapp.ricardomboukou.online";

  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw new Error('API_URL is not configured. Set NEXT_PUBLIC_API_URL environment variable.');
  }

  // Ensure URL has a protocol
  if (!url.match(/^https?:\/\//)) {
    throw new Error(`Invalid API_URL: "${url}". Must start with http:// or https://`);
  }

  return url.replace(/\/$/, ''); // Remove trailing slash
}

const API_URL = getApiUrl();

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
    const apiUrl = new URL(`${API_URL}/transactions/${id}`);
    apiUrl.searchParams.set("userEmail", session.email);

    const response = await fetch(apiUrl, {
      cache: "no-store",
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to load transaction from API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `bun run dev` (ou `bun run dev:full`) a la racine du projet." },
      { status: 502 },
    );
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
    const body = await request.json();
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        userEmail: session.email,
      }),
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to update transaction through API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `bun run dev` (ou `bun run dev:full`) a la racine du projet." },
      { status: 502 },
    );
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
    const apiUrl = new URL(`${API_URL}/transactions/${id}`);
    apiUrl.searchParams.set("userEmail", session.email);

    const response = await fetch(apiUrl, {
      method: "DELETE",
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to delete transaction through API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `bun run dev` (ou `bun run dev:full`) a la racine du projet." },
      { status: 502 },
    );
  }
}
