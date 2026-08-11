import crypto from 'crypto';

const SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-me';
export const SESSION_COOKIE = 'houn_admin_session';

export function checkCredentials(username, password) {
  const u = process.env.ADMIN_USERNAME || 'admin';
  const p = process.env.ADMIN_PASSWORD || 'changeme123';
  return username === u && password === p;
}

export function createSessionToken() {
  const payload = `admin:${Date.now()}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

export function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    const sig = parts.pop();
    const payload = parts.join(':');
    const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
    return sig === expected;
  } catch {
    return false;
  }
}
