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
  venue?: string;
  link: string; // The URL to watch the stream
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
