import { SportsFixtureConfig } from '../shared/constants';
import axios from 'axios';

const WATCHFOOTY_API = 'https://api.watchfooty.st';
const WATCHFOOTY_REFERER = 'https://watchfooty.st/';

export interface WatchFootyStream {
  id: string;
  url: string;
  quality?: string;
  language?: string;
  source?: string;
  isRedirect?: boolean;
}

export interface WatchFootyMatch {
  matchId: string;
  title: string;
  poster: string;
  teams: {
    home: { name: string; logoUrl: string; logoId: string };
    away: { name: string; logoUrl: string; logoId: string };
  };
  scores: { home: number; away: number };
  status: string;
  currentMinute: string;
  currentMinuteNumber: number;
  isEvent: boolean;
  date: string;
  timestamp: number;
  league: string;
  leagueLogo: string;
  leagueLogoId: string;
  sport: string;
  streams: WatchFootyStream[];
}

const DEFAULT_SPORTS = [
  'football',
  'basketball',
  'american-football',
  'baseball',
  'hockey',
  'motorsport',
  'fighting',
  'rugby',
  'tennis',
  'cricket',
  'golf',
  'darts',
  'snooker',
  'volleyball',
];

const wfAsset = (path: string) =>
  path.startsWith('http') ? path : `${WATCHFOOTY_API}${path}`;

async function wfFetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${WATCHFOOTY_API}${path}`, {
      headers: { Referer: WATCHFOOTY_REFERER, Origin: 'https://watchfooty.st' },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function wfFetchViaProxy<T>(path: string): Promise<T | null> {
  const bases = [
    typeof window !== 'undefined' ? `${window.location.origin}/api` : null,
    'https://streamlux.vercel.app/api',
    'https://streamlux-67a84.web.app/api',
  ].filter(Boolean) as string[];

  for (const base of bases) {
    try {
      const res = await axios.post(
        `${base}/external`,
        { provider: 'watchfooty', url: `${WATCHFOOTY_API}${path}` },
        { timeout: 20000 }
      );
      const data = res.data?.data ?? res.data;
      if (data) return data as T;
    } catch {
      // try next proxy
    }
  }
  return null;
}

async function wfGet<T>(path: string): Promise<T | null> {
  return (await wfFetchJson<T>(path)) ?? (await wfFetchViaProxy<T>(path));
}

export const mapWatchFootyToConfig = (m: WatchFootyMatch): SportsFixtureConfig => {
  let kickoffTime = m.date;
  if (m.timestamp) {
    kickoffTime = new Date(m.timestamp).toISOString();
  } else if (m.date) {
    const d = new Date(m.date);
    if (!isNaN(d.getTime())) kickoffTime = d.toISOString();
  }

  const posterUrl = m.poster ? wfAsset(m.poster) : undefined;
  const homeLogo = m.teams?.home?.logoUrl ? wfAsset(m.teams.home.logoUrl) : undefined;
  const awayLogo = m.teams?.away?.logoUrl ? wfAsset(m.teams.away.logoUrl) : undefined;
  const isLive = m.status === 'in';
  const isFinished = m.status === 'post';

  return {
    id: `wf-${m.matchId}`,
    leagueId: (m.league || m.sport || 'sports').toLowerCase().replace(/\s+/g, '-'),
    leagueName: m.league || m.sport,
    homeTeam: m.teams?.home?.name || m.title?.split(' vs ')?.[0] || 'Home',
    awayTeam: m.teams?.away?.name || m.title?.split(' vs ')?.[1] || '',
    homeTeamLogo: homeLogo,
    awayTeamLogo: awayLogo,
    status: isLive ? 'live' : isFinished ? 'ended' : 'upcoming',
    isLive,
    homeScore: m.scores?.home ?? 0,
    awayScore: m.scores?.away ?? 0,
    minute: isLive ? m.currentMinute || 'LIVE' : undefined,
    venue: 'WatchFooty',
    kickoffTimeFormatted: kickoffTime,
    streamUrl: m.streams?.[0]?.url,
    matchId: m.matchId,
    sportsCategory: m.sport,
    sport: m.sport,
    thumb: posterUrl,
    poster_path: posterUrl,
    fanart: posterUrl,
    isCompetition: m.isEvent,
    streamSources: m.streams?.map((s) => s.url) ?? [],
    watchfootyStreams: m.streams ?? [],
    provider: 'watchfooty',
  };
};

let fixturesCache: { at: number; data: SportsFixtureConfig[] } | null = null;
const CACHE_MS = 45_000;

/** All fixtures from WatchFooty across sports (cached ~45s) */
export const getWatchFootyFixtures = async (): Promise<SportsFixtureConfig[]> => {
  if (fixturesCache && Date.now() - fixturesCache.at < CACHE_MS) {
    return fixturesCache.data;
  }

  const sportsList =
    (await wfGet<Array<{ name: string }>>('/api/v1/sports'))?.map((s) => s.name) ??
    DEFAULT_SPORTS;

  const groups = await Promise.all(
    sportsList.map((sport) =>
      wfGet<WatchFootyMatch[]>(`/api/v1/matches/${sport}`).then((rows) => rows ?? [])
    )
  );

  const all = groups.flat().map(mapWatchFootyToConfig);
  const seen = new Set<string>();
  const unique = all.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  fixturesCache = { at: Date.now(), data: unique };
  return unique;
};

export const getWatchFootyLive = async (): Promise<SportsFixtureConfig[]> => {
  const all = await getWatchFootyFixtures();
  return all.filter((f) => f.isLive);
};

export const getWatchFootyScheduled = async (): Promise<SportsFixtureConfig[]> => {
  const all = await getWatchFootyFixtures();
  return all.filter((f) => !f.isLive && f.status !== 'ended' && f.status !== 'FT');
};

export const getWatchFootyMatchById = async (
  matchId: string
): Promise<SportsFixtureConfig | null> => {
  const clean = matchId.replace(/^wf-/, '');
  const cached = (await getWatchFootyFixtures()).find(
    (f) => f.matchId === clean || f.id === `wf-${clean}`
  );
  if (cached) return cached;

  for (const sport of DEFAULT_SPORTS) {
    const rows = await wfGet<WatchFootyMatch[]>(`/api/v1/matches/${sport}`);
    const hit = rows?.find((m) => m.matchId === clean);
    if (hit) return mapWatchFootyToConfig(hit);
  }
  return null;
};

export const watchfootyToSportMatch = (f: SportsFixtureConfig) => ({
  id: f.id,
  homeTeam: f.homeTeam,
  awayTeam: f.awayTeam,
  homeTeamLogo: f.homeTeamLogo,
  awayTeamLogo: f.awayTeamLogo,
  status: (f.isLive ? 'live' : f.status === 'ended' ? 'finished' : 'upcoming') as
    | 'live'
    | 'upcoming'
    | 'finished',
  isLive: !!f.isLive,
  kickoffTimeFormatted: f.kickoffTimeFormatted || new Date().toISOString(),
  leagueName: f.leagueName,
  leagueId: f.leagueId,
  sport: f.sportsCategory || f.sport,
  sportsCategory: f.sportsCategory || f.sport,
  homeScore: f.homeScore,
  awayScore: f.awayScore,
  minute: f.minute,
  venue: f.venue,
  streamUrl: f.streamUrl,
  thumb: f.thumb || f.poster_path,
  poster_path: f.poster_path || f.thumb,
  fanart: f.fanart,
  link: f.streamUrl || '',
  isCompetition: f.isCompetition,
  matchId: f.matchId,
  watchfootyStreams: f.watchfootyStreams,
  sources: f.watchfootyStreams?.map((s) => ({ source: s.source || 'watchfooty', id: s.id })),
});
