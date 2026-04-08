import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../../../lib/auth";

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

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      { error: "Session invalide. Connectez-vous à nouveau." },
      { status: 401 },
    );
  }

  try {
    const url = new URL(`${API_URL}/transactions`);
    url.searchParams.set("userEmail", session.email);

    console.log(`[API PROXY] Fetching ${url.toString()}`);
    const response = await fetch(url, {
      cache: "no-store",
    });
    console.log(`[API PROXY] Status: ${response.status}`);
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to load transactions from API:", error);

    return NextResponse.json(
      { 
        error: "Le backend API est indisponible.", 
        details: error instanceof Error ? error.message : String(error),
        apiUrl: API_URL
      },
      { status: 502 },
    );
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
    const body = await request.json();
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        userEmail: session.email,
        userName: session.name,
      }),
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to create transaction through API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `bun run dev` (ou `bun run dev:full`) a la racine du projet." },
      { status: 502 },
    );
  }
}
