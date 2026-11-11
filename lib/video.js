export function youTubeId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^m\./, '').replace(/^www\./, '');
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null;
    if (host === 'youtube.com' || host === 'music.youtube.com') {
      if (u.searchParams.get('v')) return u.searchParams.get('v');
      const seg = u.pathname.split('/').filter(Boolean);
      const i = seg.findIndex((s) => ['shorts', 'embed', 'live'].includes(s));
      if (i !== -1 && seg[i + 1]) return seg[i + 1];
    }
  } catch {}
  return null;
}

export function videoKind(url = '') {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'file';
  if (youTubeId(url)) return 'youtube';
  if (/vimeo\.com/i.test(url)) return 'vimeo';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  return 'link';
}

export function videoThumbnail(video) {
  if (video.thumbnail) return video.thumbnail;
  const id = youTubeId(video.videoUrl);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

export function embedUrl(url) {
  const kind = videoKind(url);
  if (kind === 'youtube') return `https://www.youtube.com/embed/${youTubeId(url)}?autoplay=1&rel=0&modestbranding=1`;
  if (kind === 'vimeo') {
    const id = new URL(url).pathname.split('/').filter(Boolean).pop();
    return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }
  if (kind === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&autoplay=true`;
  }
  return null;
}
