import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "../../../../../../packages/database/index";
import {
  SESSION_COOKIE_NAME,
  getSessionCookieOptions,
  verifySessionToken,
} from "../../../../lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await getUserByEmail(session.email);

  if (!user) {
    const response = NextResponse.json({ user: null }, { status: 200 });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ user }, { status: 200 });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true }, { status: 200 });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}
