export interface APIMatchSource {
  source: string;
  id: string;
}

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: {
    home?: { name: string; badge: string };
    away?: { name: string; badge: string };
  };
  sources: APIMatchSource[];
}

export interface APIStream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

export interface SportMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  status: 'live' | 'upcoming' | 'finished';
  isLive: boolean;
  kickoffTimeFormatted: string;
  leagueName?: string;
  leagueId?: string;
  sport?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  period?: string;
  clock?: string;
  isFinished?: boolean;
  venue?: string;
  link?: string;
  isCompetition?: boolean;
  sources?: APIMatchSource[];
  streamUrl?: string;
  thumb?: string;
  poster_path?: string;
  fanart?: string;
  sportsCategory?: string;
  streamSources?: string[];
  watchfootyStreams?: Array<{
    id: string;
    url: string;
    quality?: string;
    language?: string;
    source?: string;
  }>;
  matchId?: string;
}

export interface SportLeague {
  id: string;
  name: string;
  logo?: string;
  sport: string;
}

export interface SportsDataResponse {
  success: boolean;
  data: SportMatch[];
}
