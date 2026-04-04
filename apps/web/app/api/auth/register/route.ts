import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "../../../../../../packages/database/index";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const name = body.name?.trim() || null;
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 },
      );
    }

    const user = await registerUser({
      email,
      name,
      password,
    });
    const token = await createSessionToken(user);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    return response;
  } catch (error) {
    console.error("Registration failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Inscription impossible pour le moment.",
      },
      { status: 400 },
    );
  }
}
