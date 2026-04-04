import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../../../../lib/auth";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

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
    const apiUrl = new URL(`${API_URL}/insights/summary`);
    apiUrl.searchParams.set("userEmail", session.email);

    const response = await fetch(apiUrl, {
      cache: "no-store",
    });
    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to load insights from API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `bun run dev` (ou `bun run dev:full`) a la racine du projet." },
      { status: 502 },
    );
  }
}
