const INNERTUBE_KEYS = [
  'AIzaSyBXl3lLvGxMOtqtYn75f_X68mc8P-O81qQ',
  'AIzaSyC4Mz02lYxZSdaA5N-l363GlIJiblhC3sM',
  'AIzaSyB8lDctBCl-3JPNgJSau3TvulbevDyvNyQ',
];

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.ot.ax',
  'https://pipedapi.drgns.space',
  'https://piped-api.lunar.icu',
];

function apiBases(): string[] {
  const bases = [
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/api`
      : '',
    'https://streamlux.vercel.app/api',
    'https://streamlux-67a84.web.app/api',
  ].filter(Boolean) as string[];
  return bases;
}

export async function postInnertube(body: Record<string, unknown>): Promise<unknown> {
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base}/innertube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) return data;
      }
    } catch {
      /* next */
    }
  }

  const clientName = String(body.client || 'WEB_REMIX');
  const host = clientName === 'WEB' ? 'www.youtube.com' : 'music.youtube.com';
  const endpoint = String(body.endpoint || '/search');
  const key = INNERTUBE_KEYS[Math.floor(Math.random() * INNERTUBE_KEYS.length)];
  const itUrl = `https://${host}/youtubei/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}?key=${key}`;

  const res = await fetch(itUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: `https://${host}`,
      Referer: `https://${host}/`,
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName,
          clientVersion: clientName === 'WEB_REMIX' ? '1.20250218.01.00' : '2.20250218.01.00',
          hl: 'en',
          gl: 'US',
        },
      },
      ...(body.query && { query: body.query }),
      ...(body.videoId && { videoId: body.videoId }),
      ...(body.browseId && { browseId: body.browseId }),
    }),
  });
  return res.json();
}

export async function pipedSearch(
  q: string,
  filter: string
): Promise<{ items?: unknown[] }> {
  const qs = `q=${encodeURIComponent(q)}&filter=${encodeURIComponent(filter)}`;
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base}/piped-search?${qs}`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data?.items?.length) return data;
      }
    } catch {
      /* next */
    }
  }

  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}/search?${qs}`, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data?.items?.length) return data;
      }
    } catch {
      /* next */
    }
  }
  return { items: [] };
}

export async function pipedStreams(videoId: string): Promise<unknown> {
  const qs = `videoId=${encodeURIComponent(videoId)}`;
  for (const base of apiBases()) {
    try {
      const res = await fetch(`${base}/piped-streams?${qs}`, { headers: { Accept: 'application/json' } });
      if (res.ok) return res.json();
    } catch {
      /* next */
    }
  }

  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}/streams/${videoId}`, { headers: { Accept: 'application/json' } });
      if (res.ok) return res.json();
    } catch {
      /* next */
    }
  }
  return { audioStreams: [], videoStreams: [] };
}
