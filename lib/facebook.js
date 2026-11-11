// Facebook "share" links (facebook.com/share/v/…, fb.watch/…) can't be played
// inside another website. Facebook turns them into a real video address
// (facebook.com/reel/123… or …/videos/123…) when you open them, which can be
// embedded. This follows that redirect on the server when a video is saved.

const SHARE_RE = /^https?:\/\/(www\.|m\.|web\.)?(facebook\.com\/share\/(v|r)\/|fb\.watch\/)/i;

export function isFacebookShareLink(url) {
  return SHARE_RE.test(url || '');
}

function cleanFacebookUrl(url) {
  try {
    const u = new URL(url, 'https://www.facebook.com');
    if (u.pathname.startsWith('/login') && u.searchParams.get('next')) {
      return cleanFacebookUrl(u.searchParams.get('next'));
    }
    const reel = u.pathname.match(/\/reel\/(\d+)/);
    if (reel) return `https://www.facebook.com/reel/${reel[1]}`;
    const vid = u.pathname.match(/\/videos\/(?:[^/]+\/)?(\d+)/);
    if (vid) return `https://www.facebook.com${u.pathname.replace(/\/$/, '')}`;
    if (u.pathname === '/watch/' || u.pathname === '/watch') {
      const v = u.searchParams.get('v');
      if (v) return `https://www.facebook.com/watch/?v=${v}`;
    }
  } catch {}
  return null;
}

export async function resolveFacebookLink(url) {
  if (!isFacebookShareLink(url)) return url;
  let current = url;
  try {
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetch(current, {
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      });
      const location = res.headers.get('location');
      if (!location) break;
      const clean = cleanFacebookUrl(location);
      if (clean) return clean;
      current = new URL(location, current).toString();
    }
  } catch (e) {
    console.error('Could not resolve Facebook link', e);
  }
  return url; // fall back to the original link
}
