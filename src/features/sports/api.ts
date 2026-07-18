import { SportsDataResponse, SportMatch } from './types';

const wfToSportMatch = (f: import('../../shared/constants').SportsFixtureConfig): SportMatch => ({
  id: f.id,
  homeTeam: f.homeTeam,
  awayTeam: f.awayTeam,
  homeTeamLogo: f.homeTeamLogo,
  awayTeamLogo: f.awayTeamLogo,
  status: f.isLive ? 'live' : f.status === 'ended' ? 'finished' : 'upcoming',
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
  thumb: f.poster_path || f.thumb,
  poster_path: f.poster_path || f.thumb,
  fanart: f.fanart,
  link: f.streamUrl || '',
  isCompetition: f.isCompetition,
  matchId: f.matchId,
  watchfootyStreams: f.watchfootyStreams,
  sources: f.watchfootyStreams?.map((s) => ({
    source: s.source || 'watchfooty',
    id: s.id,
  })),
});

export const sportsService = {
  getLiveMatches: async (): Promise<SportsDataResponse> => {
    try {
      const { getWatchFootyLive } = await import('../../services/watchfootyAPI');
      const live = await getWatchFootyLive();
      return { success: true, data: live.map(wfToSportMatch) };
    } catch (error) {
      console.error('Error fetching WatchFooty live matches:', error);
      return { success: false, data: [] };
    }
  },

  getUpcomingMatches: async (): Promise<SportsDataResponse> => {
    try {
      const { getWatchFootyScheduled } = await import('../../services/watchfootyAPI');
      const upcoming = await getWatchFootyScheduled();
      return { success: true, data: upcoming.map(wfToSportMatch) };
    } catch (error) {
      console.error('Error fetching WatchFooty upcoming matches:', error);
      return { success: false, data: [] };
    }
  },

  getMatchStreams: async (_source: string, _id: string) => {
    return [];
  },
};
