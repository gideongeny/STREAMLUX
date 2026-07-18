import { SportsFixtureConfig } from "../shared/constants";

/** Cinematic stadium backdrops when API posters are missing */
export const SPORT_BACKDROP_BY_CATEGORY: Record<string, string> = {
  soccer: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&q=80",
  football: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&q=80",
  basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1280&q=80",
  baseball: "https://images.unsplash.com/photo-1566577739112-5180d4bf9391?w=1280&q=80",
  hockey: "https://images.unsplash.com/photo-1547036967-23d4baca3266?w=1280&q=80",
  cricket: "https://images.unsplash.com/photo-1531415071028-493681f163a6?w=1280&q=80",
  tennis: "https://images.unsplash.com/photo-1554068865-24cecd4e1efe?w=1280&q=80",
  fighting: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1280&q=80",
  ufc: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1280&q=80",
  f1: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b8?w=1280&q=80",
  rugby: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&q=80",
  default: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1280&q=80",
};

const CRICHD_JSON =
  "https://raw.githubusercontent.com/abusaeeidx/CricHd-playlists-Auto-Update-permanent/main/api.json";

/** streaming-ticker style leagues (ESPN public scoreboards) */
const TICKER_ESPN_PATHS = [
  "/soccer/eng.1/scoreboard",
  "/soccer/esp.1/scoreboard",
  "/soccer/ita.1/scoreboard",
  "/soccer/ger.1/scoreboard",
  "/soccer/uefa.champions/scoreboard",
  "/basketball/nba/scoreboard",
  "/football/nfl/scoreboard",
  "/baseball/mlb/scoreboard",
  "/hockey/nhl/scoreboard",
  "/racing/f1/scoreboard",
  "/mma/ufc/scoreboard",
];

export function inferSportFromChannelName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cricket") || n.includes("willow") || n.includes("star sports")) return "Cricket";
  if (n.includes("f1") || n.includes("racing") || n.includes("motogp")) return "Motorsport";
  if (n.includes("nba") || n.includes("basketball")) return "Basketball";
  if (n.includes("nfl") || n.includes("football") && !n.includes("soccer")) return "American Football";
  if (n.includes("hockey") || n.includes("nhl")) return "Ice Hockey";
  if (n.includes("tennis")) return "Tennis";
  if (n.includes("golf")) return "Golf";
  if (n.includes("ufc") || n.includes("fight")) return "Fighting";
  if (n.includes("premier") || n.includes("liga") || n.includes("soccer") || n.includes("sky sports")) return "Football";
  return "Sports";
}

export function enrichFixtureCoverArt(fixture: SportsFixtureConfig): SportsFixtureConfig {
  const sportKey = (fixture.sportsCategory || fixture.sport || "soccer").toLowerCase();
  const backdropKey = Object.keys(SPORT_BACKDROP_BY_CATEGORY).find((k) => sportKey.includes(k)) || "default";
  const fallback = SPORT_BACKDROP_BY_CATEGORY[backdropKey] || SPORT_BACKDROP_BY_CATEGORY.default;

  const cover =
    fixture.thumb ||
    fixture.poster_path ||
    fixture.fanart ||
    fixture.banner ||
    (fixture.homeTeamLogo && fixture.homeTeamLogo.startsWith("http") ? fixture.homeTeamLogo : undefined) ||
    fallback;

  return {
    ...fixture,
    thumb: cover,
    poster_path: cover,
    fanart: fixture.fanart || cover,
  };
}

export function enrichFixturesCovers(fixtures: SportsFixtureConfig[]): SportsFixtureConfig[] {
  return fixtures.map(enrichFixtureCoverArt);
}

// ─── DaddyLive ─────────────────────────────────────────────────────────────
// DaddyLive provides hundreds of live sports channels as direct HLS (.m3u8)
// streams with no ad redirect pages, completely free.
const DADDYLIVE_API = "https://daddylivehd.sx/api";
const DADDYLIVE_CHANNEL_M3U8 = (id: string) =>
  `https://daddylivehd.sx/api/hls/${id}/index.m3u8`;

interface DaddyMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  poster?: string;
  teams?: { home?: { name: string; badge: string }; away?: { name: string; badge: string } };
  sources?: Array<{ source: string; id: string }>;
}

function mapDaddyLiveMatch(match: DaddyMatch): SportsFixtureConfig {
  const isVs = match.title.includes(" vs ");
  const parts = isVs ? match.title.split(" vs ") : [match.title, ""];
  const homeBadge = match.teams?.home?.badge;
  const awayBadge = match.teams?.away?.badge;
  const isLive = match.date <= Date.now();

  // Build direct HLS URLs for every source — no iframe redirect pages
  const watchfootyStreams = (match.sources || []).map((s, i) => ({
    id: `dl-${match.id}-${i}`,
    url: DADDYLIVE_CHANNEL_M3U8(s.id),
    quality: "HD",
    source: s.source,
  }));

  return enrichFixtureCoverArt({
    id: `dl-${match.id}`,
    leagueId: match.category || "live",
    leagueName:
      match.category.charAt(0).toUpperCase() + match.category.slice(1),
    homeTeam: match.teams?.home?.name || parts[0] || "Home",
    awayTeam: match.teams?.away?.name || parts[1] || "",
    homeTeamLogo: homeBadge
      ? `${DADDYLIVE_API}/images/badge/${homeBadge}.webp`
      : undefined,
    awayTeamLogo: awayBadge
      ? `${DADDYLIVE_API}/images/badge/${awayBadge}.webp`
      : undefined,
    status: isLive ? "live" : "upcoming",
    isLive,
    kickoffTimeFormatted: new Date(match.date).toISOString(),
    sportsCategory: match.category,
    sport: match.category,
    // Primary direct HLS URL so the player can play without any redirect
    streamUrl: watchfootyStreams[0]?.url,
    watchfootyStreams,
    streamSources: watchfootyStreams.map((s) => s.url),
    isCompetition: !isVs,
    minute: isLive ? "LIVE" : undefined,
    venue: "DaddyLive",
    provider: "daddylive",
  });
}

/** DaddyLive live matches — returns direct .m3u8 streams, zero ad pages */
export async function fetchDaddyLiveLive(): Promise<SportsFixtureConfig[]> {
  try {
    const res = await fetch(`${DADDYLIVE_API}/matches/live`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw.map(mapDaddyLiveMatch);
  } catch {
    return [];
  }
}

/** DaddyLive upcoming matches today */
export async function fetchDaddyLiveUpcoming(): Promise<SportsFixtureConfig[]> {
  try {
    const res = await fetch(`${DADDYLIVE_API}/matches/all-today`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((m: DaddyMatch) => m.date > Date.now())
      .map(mapDaddyLiveMatch);
  } catch {
    return [];
  }
}

// ─── Streamed.pk (fallback) ──────────────────────────────────────────────────────
// Kept as fallback — used only if DaddyLive returns nothing.
const STREAMED_PK_BASE = "https://streamed.pk/api";

function mapStreamedPkMatch(match: {
  id: string;
  title: string;
  category: string;
  date: number;
  teams?: { home?: { name: string; badge: string }; away?: { name: string; badge: string } };
  sources?: Array<{ source: string; id: string } | string>;
}): SportsFixtureConfig {
  const isVs = match.title.includes(" vs ");
  const parts = isVs ? match.title.split(" vs ") : [match.title, ""];
  const homeBadge = match.teams?.home?.badge;
  const awayBadge = match.teams?.away?.badge;
  const streamSources = (match.sources || []).map((s, i) =>
    typeof s === "string" ? s : s.source || `src${i}`
  );
  const isLive = match.date <= Date.now();
  return enrichFixtureCoverArt({
    id: `spk-${match.id}`,
    leagueId: match.category || "live",
    leagueName: match.category.charAt(0).toUpperCase() + match.category.slice(1),
    homeTeam: match.teams?.home?.name || parts[0] || "Home",
    awayTeam: match.teams?.away?.name || parts[1] || "",
    homeTeamLogo: homeBadge ? `${STREAMED_PK_BASE}/images/badge/${homeBadge}.webp` : undefined,
    awayTeamLogo: awayBadge ? `${STREAMED_PK_BASE}/images/badge/${awayBadge}.webp` : undefined,
    status: isLive ? "live" : "upcoming",
    isLive,
    kickoffTimeFormatted: new Date(match.date).toISOString(),
    sportsCategory: match.category,
    sport: match.category,
    streamSources,
    isCompetition: !isVs,
    minute: isLive ? "LIVE" : undefined,
    venue: "Streamed",
    provider: "streamedpk",
  });
}

async function fetchStreamedPkLiveRaw(): Promise<SportsFixtureConfig[]> {
  try {
    const res = await fetch(`${STREAMED_PK_BASE}/matches/live`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw.map(mapStreamedPkMatch);
  } catch {
    return [];
  }
}

async function fetchStreamedPkUpcomingRaw(): Promise<SportsFixtureConfig[]> {
  try {
    const res = await fetch(`${STREAMED_PK_BASE}/matches/all-today`, {
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const raw = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((m: { date: number }) => m.date > Date.now())
      .map(mapStreamedPkMatch);
  } catch {
    return [];
  }
}

/**
 * Live matches: DaddyLive first (direct HLS, no ads).
 * Falls back to Streamed.pk if DaddyLive returns nothing.
 */
export async function fetchStreamedPkLive(): Promise<SportsFixtureConfig[]> {
  const daddy = await fetchDaddyLiveLive();
  if (daddy.length > 0) return daddy;
  return fetchStreamedPkLiveRaw();
}

/**
 * Upcoming matches: DaddyLive first, Streamed.pk as fallback.
 */
export async function fetchStreamedPkUpcoming(): Promise<SportsFixtureConfig[]> {
  const daddy = await fetchDaddyLiveUpcoming();
  if (daddy.length > 0) return daddy;
  return fetchStreamedPkUpcomingRaw();
}

/** Map CricHd auto-updated JSON channels → live sports cards with cover art */
export function mapCricHdChannels(channels: Array<{ name: string; id?: string; logo?: string; link?: string }>): SportsFixtureConfig[] {
  return channels.map((ch, i) => {
    const sport = inferSportFromChannelName(ch.name || "");
    const logo = ch.logo || "";
    return enrichFixtureCoverArt({
      id: `crichd-${ch.id || i}`,
      leagueId: "live-sports-tv",
      leagueName: "Live Sports TV",
      homeTeam: ch.name || "Live Channel",
      awayTeam: "Broadcasting Now",
      homeTeamLogo: logo,
      awayTeamLogo: logo,
      thumb: logo,
      poster_path: logo,
      status: "live",
      isLive: true,
      kickoffTimeFormatted: new Date().toISOString(),
      venue: "CricHD",
      streamUrl: ch.link,
      sportsCategory: sport,
      sport,
      minute: "LIVE",
    });
  });
}

export async function fetchCricHdChannels(): Promise<SportsFixtureConfig[]> {
  try {
    const res = await fetch(CRICHD_JSON, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return mapCricHdChannels(data);
  } catch {
    return [];
  }
}

/** ESPN paths used by streaming-ticker — returns fixtures with team logos for card art */
export async function fetchTickerStyleEspnFixtures(wantLive: boolean): Promise<SportsFixtureConfig[]> {
  const todayStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const fixtures: SportsFixtureConfig[] = [];

  const results = await Promise.allSettled(
    TICKER_ESPN_PATHS.map((ep) =>
      fetch(`https://site.api.espn.com/apis/site/v2/sports${ep}?dates=${todayStr}`, {
        signal: AbortSignal.timeout(8000),
      }).then((r) => r.json())
    )
  );

  results.forEach((res, i) => {
    if (res.status !== "fulfilled" || !res.value?.events) return;
    const sportSlug = TICKER_ESPN_PATHS[i].split("/")[1];
    const sportLabel = sportSlug.charAt(0).toUpperCase() + sportSlug.slice(1);

    res.value.events.forEach((e: any) => {
      const c = e.competitions?.[0];
      const h = c?.competitors?.find((x: any) => x.homeAway === "home");
      const a = c?.competitors?.find((x: any) => x.homeAway === "away");
      if (!h || !a) return;

      const status = e.status?.type?.name || "STATUS_SCHEDULED";
      const isLive = status.includes("LIVE") || status.includes("IN_PROGRESS");
      if (wantLive && !isLive) return;
      if (!wantLive && isLive) return;

      const homeLogo = h.team?.logo;
      const awayLogo = a.team?.logo;
      const venueImg = c?.venue?.images?.[0]?.href;

      fixtures.push(
        enrichFixtureCoverArt({
          id: `ticker-espn-${e.id}`,
          sport: sportSlug,
          sportsCategory: sportLabel,
          leagueName: e.season?.name || e.leagues?.[0]?.name || sportLabel,
          leagueId: sportSlug,
          homeTeam: h.team?.displayName || "Home",
          awayTeam: a.team?.displayName || "Away",
          homeTeamLogo: homeLogo,
          awayTeamLogo: awayLogo,
          homeScore: h.score ? Number(h.score) : 0,
          awayScore: a.score ? Number(a.score) : 0,
          isLive,
          status: isLive ? "live" : "upcoming",
          minute: e.status?.displayClock || e.status?.type?.shortDetail,
          venue: c?.venue?.fullName || "Stadium",
          kickoffTimeFormatted: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
          thumb: venueImg || homeLogo,
          poster_path: venueImg || homeLogo,
        })
      );
    });
  });

  return fixtures;
}
