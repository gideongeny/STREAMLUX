/** Helpers for Kenyan / YouTube Live TV channels */

export const KENYA_CHANNEL_ORDER = [
  'citizen-tv-ke',
  'ntv-kenya',
  'ktn-kenya',
  'tv47-kenya',
  'k24-kenya',
  'ramogi-tv',
] as const;

export function extractYouTubeVideoId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** Embed URL tuned for web + Capacitor WebView (autoplay needs mute) */
export function buildYouTubeLiveEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    controls: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
    iv_load_policy: '3',
    fs: '1',
    origin: typeof window !== 'undefined' ? window.location.origin : 'https://streamlux-67a84.web.app',
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function buildYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function isYouTubeChannel(channel: { type?: string; url?: string; youtubeId?: string }): boolean {
  if (channel.type === 'youtube' || channel.youtubeId) return true;
  return !!extractYouTubeVideoId(channel.url || '');
}

export function resolveYouTubeId(channel: { url?: string; youtubeId?: string }): string | null {
  return channel.youtubeId || extractYouTubeVideoId(channel.url || '') || null;
}
