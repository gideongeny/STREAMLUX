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
  period?: string; // e.g. "1st Quarter", "HT", "2nd Half"
  clock?: string;  // e.g. "12:45", "45+2'"
  isFinished?: boolean;
  venue?: string;
  link: string; // The URL to watch the stream
  isCompetition?: boolean; // Flag for racing/mma/golf that aren't 'vs' matches
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
