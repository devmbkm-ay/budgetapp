import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, updateUserProfile } from "../../../../../packages/database/index";
import { SESSION_COOKIE_NAME, createSessionToken, getSessionCookieOptions, verifySessionToken } from "../../../lib/auth";

async function getSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const user = await getUserByEmail(session.email);
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  try {
    const updated = await updateUserProfile({
      userId: session.id,
      name: body.name,
      email: body.email,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    // Refresh session cookie with updated info
    const newToken = await createSessionToken({ id: updated.id, email: updated.email, name: updated.name });
    const response = NextResponse.json({ user: updated });
    response.cookies.set(SESSION_COOKIE_NAME, newToken, getSessionCookieOptions());
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
