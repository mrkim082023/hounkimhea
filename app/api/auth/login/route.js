import { NextResponse } from 'next/server';
import { checkCredentials, createSessionToken, SESSION_COOKIE } from '../../../../lib/auth';

export async function POST(request) {
  const { username, password } = await request.json();

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
