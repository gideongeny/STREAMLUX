export interface SportsChannel {
  name: string;
  type: 'iframe' | 'hls';
  url: string;
  isExternal?: boolean;
}

export const ALL_SPORTS_CHANNELS: SportsChannel[] = [
  { 
    name: 'Mirror 1 (Premium)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=Rm5vaFdRd1hMck0xejhpMUNHdE9lTFVsbEVjTUlpaWhqSENROVpBOFBZZzZuWElaTExGQ1B1RGVBVGN0QW9QMQ~~' 
  },
  { 
    name: 'Mirror 2 (Standard)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQTNoQ2pnT0UyK25QdE5uRm5GTW94UEJQK2hPUGdDRytmOWV2Tm1UQUhKbXc9PQ~~' 
  },
  { 
    name: 'Mirror 3 (Alternate)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQTNoQ2pnT0UyK25QdE5uRm5GTW94UEJQK2hPUGdDRytmOWV2Tm1UQUhKbXc9PQ~~' 
  },
  { 
    name: 'Mirror 4 (Backup)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQTNoQ2pnT0UyK25QdE5uRm5GTW94UEJQK2hPUGdDRytmOWV2Tm1UQUhKbXc9PQ~~' 
  },
  { 
    name: 'Mirror 5 (Fast)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQTNoQ2pnT0UyK25QdE5uRm5GTW94UEJQK2hPUGdDRytmOWV2Tm1UQUhKbXc9PQ~~' 
  },
  { 
    name: 'Mirror 6 (Global)', 
    type: 'iframe', 
    url: 'https://ntv.cx/embed?t=RnBicEVST3ZWdWxIOTdKVHE4MlUydFlKR00weWtLd1orQ21LeUtTNTVuQTNoQ2pnT0UyK25QdE5uRm5GTW94UEJQK2hPUGdDRytmOWV2Tm1UQUhKbXc9PQ~~' 
  },
  { name: 'DAZN 1', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free' },
  { name: 'DAZN 3', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=DAZN%203&code=es&user=cdnlivetv&plan=free' },
  { name: 'DAZN LaLiga', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=DAZN%20LaLiga&code=es&user=cdnlivetv&plan=free' },
  { name: 'DAZN LaLiga 2', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=DAZN%20LaLiga%202&code=es&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 1', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%201&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 2', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%202&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 3', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%203&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 4', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%204&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 5', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%205&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 7', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%207&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 8', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%208&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport Bundesliga 10', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20Bundesliga%2010&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport 1', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%201&code=de&user=cdnlivetv&plan=free' },
  { name: 'Sky Sport NBA', type: 'iframe', url: 'https://cdnlivetv.tv/api/v1/channels/player/?name=Sky%20Sport%20NBA&code=it&user=cdnlivetv&plan=free' }
];

export const getFallbackChannel = (leagueId?: string): SportsChannel => {
  return ALL_SPORTS_CHANNELS[0];
};

export const getDynamicMatchSources = (match: any): SportsChannel[] => {
  return ALL_SPORTS_CHANNELS;
};

export const getStreamEastSources = (match: any): SportsChannel[] => {
  return []; // Removed as per request
};

export const getSafeChannel = (): SportsChannel => {
  return ALL_SPORTS_CHANNELS[0];
};

export const getStreamSports99Mirror = (home: string, away: string): SportsChannel => {
  const query = encodeURIComponent(`${home} vs ${away}`);
  return {
    name: 'Mirror (StreamSports99)',
    type: 'iframe',
    url: `https://streamsports99.website/?search=${query}`,
    isExternal: true
  };
};

export const generateStreamEastSlug = (home: string, away: string, sport?: string): string => "";
export const getStreamEastCategory = (sport: string): string => "";
