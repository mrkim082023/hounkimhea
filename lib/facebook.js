// Facebook "share" links (facebook.com/share/v/…, /share/r/…, fb.watch/…) can't
// be played inside another website. Facebook turns them into a real video
// address (facebook.com/reel/123… or …/videos/123…) when opened, and that one
// can be embedded. These helpers find that real address on the server.

const SHARE_RE = /^https?:\/\/(www\.|m\.|web\.)?(facebook\.com\/share\/(v|r|p)\/|fb\.watch\/)/i;

export function isFacebookShareLink(url) {
  return SHARE_RE.test(url || '');
}

// Turns any Facebook address that points at a video into a clean, embeddable one.
export function cleanFacebookUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url.replace(/&amp;/g, '&'), 'https://www.facebook.com');
    if (!/facebook\.com$/i.test(u.hostname.replace(/^(www|m|web)\./, ''))) return null;
    for (const key of ['next', 'u', 'href']) {
      const inner = u.searchParams.get(key);
      if (inner && /facebook\.com/.test(inner)) {
        const c = cleanFacebookUrl(inner);
        if (c) return c;
      }
    }
    const reel = u.pathname.match(/\/reels?\/(\d{6,})/);
    if (reel) return `https://www.facebook.com/reel/${reel[1]}`;
    const vid = u.pathname.match(/^(.*\/videos\/(?:[^/]+\/)?\d{6,})/);
    if (vid) return `https://www.facebook.com${vid[1]}`;
    if (/^\/watch\/?$/.test(u.pathname) && u.searchParams.get('v')) {
      return `https://www.facebook.com/watch/?v=${u.searchParams.get('v')}`;
    }
  } catch {}
  return null;
}

function findInHtml(html) {
  const patterns = [
    /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    /(https?:\\?\/\\?\/(?:www\.|m\.)?facebook\.com\\?\/reel\\?\/\d{6,})/i,
    /(https?:\\?\/\\?\/(?:www\.|m\.)?facebook\.com\\?\/[^"'\s]+\\?\/videos\\?\/\d{6,})/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const c = cleanFacebookUrl(m[1].replace(/\\\//g, '/'));
      if (c) return c;
    }
  }
  return null;
}

const AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

async function tryResolve(url, agent) {
  // 1) Follow redirects one by one and look at each address.
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    const res = await fetch(current, {
      redirect: 'manual',
      headers: { 'User-Agent': agent, 'Accept-Language': 'en-US,en;q=0.9', Accept: 'text/html' },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    const location = res.headers.get('location');
    if (location) {
      const clean = cleanFacebookUrl(location);
      if (clean) return clean;
      current = new URL(location, current).toString();
      continue;
    }
    // 2) No more redirects: look inside the page for the real video address.
    if (res.ok) {
      const html = (await res.text()).slice(0, 600000);
      return findInHtml(html);
    }
    return null;
  }
  return null;
}

export async function resolveFacebookLink(url) {
  if (!isFacebookShareLink(url)) return cleanFacebookUrl(url) || url;
  for (const agent of AGENTS) {
    try {
      const found = await tryResolve(url, agent);
      if (found) return found;
    } catch (e) {
      console.error('Facebook link lookup failed', e?.message);
    }
  }
  return url; // could not resolve — keep the original link
}
