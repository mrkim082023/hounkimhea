import { NextResponse } from 'next/server';

const PUBLIC_ADMIN_PATHS = ['/admin', '/api/auth/login'];
const SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-me';

async function verifyToken(token) {
  try {
    const decoded = atob(token);
    const parts = decoded.split(':');
    const sig = parts.pop();
    const payload = parts.join(':');

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const expected = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return sig === expected;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const needsAuth =
    (pathname.startsWith('/admin') && !PUBLIC_ADMIN_PATHS.includes(pathname)) ||
    (pathname.startsWith('/api/') &&
      pathname !== '/api/auth/login' &&
      request.method !== 'GET');

  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get('houn_admin_session')?.value;
  const valid = token ? await verifyToken(token) : false;

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
