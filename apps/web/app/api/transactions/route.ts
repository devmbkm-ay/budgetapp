import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001";

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      cache: "no-store",
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to load transactions from API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `apps/api` sur le port 3001." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    console.error("Failed to create transaction through API:", error);

    return NextResponse.json(
      { error: "Le backend API est indisponible. Lance `apps/api` sur le port 3001." },
      { status: 502 },
    );
  }
}
