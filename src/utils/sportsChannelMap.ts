export interface SportsChannel {
  name: string;
  type: 'iframe' | 'hls';
  url: string;
}

export const ALL_SPORTS_CHANNELS: SportsChannel[] = [
  { name: 'ESPN', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free' },
  { name: 'ESPN 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN%202&code=us&user=cdnlivetv&plan=free' },
  { name: 'ESPN 3', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN%203&code=us&user=cdnlivetv&plan=free' },
  { name: 'TNT', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT&code=us&user=cdnlivetv&plan=free' },
  { name: 'ABC', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ABC&code=us&user=cdnlivetv&plan=free' },
  { name: 'Fox Sports 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=FS1&code=us&user=cdnlivetv&plan=free' },
  { name: 'Fox Sports 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=FS2&code=us&user=cdnlivetv&plan=free' },
  { name: 'CBS Sports', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=CBS%20Sports%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'NBA TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free' },
  { name: 'NFL Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NFL%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'MLB Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=MLB%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'NHL Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NHL%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Premier League', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Premier%20League&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Main Event', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Main%20Event&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Football', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Football&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports F1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20F1&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Golf', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Golf&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Cricket', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Cricket&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Sky Sports Tennis', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free' },
  { name: 'TNT Sports 1 (UK)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%201&code=gb&user=cdnlivetv&plan=free' },
  { name: 'TNT Sports 2 (UK)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%202&code=gb&user=cdnlivetv&plan=free' },
  { name: 'beIN SPORTS (US)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free' },
  { name: 'USA Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: '123HD - ESPN', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/espn.php?' },
  { name: '123HD - ESPN 2', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/espn2.php?' },
  { name: '123HD - TNT', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/tnt.php?' },
  { name: '123HD - NBA TV', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/nba.php?' },
  { name: '123HD - FS1', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/fs1.php?' }
];

export const getFallbackChannel = (leagueId: string): SportsChannel => {
  const normalized = leagueId?.toLowerCase() || '';

  if (normalized.includes('nba') || normalized.includes('basketball')) {
    return { name: 'NBA TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('wwe')) {
    return { name: 'WWE Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=WWE&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('mlb') || normalized.includes('baseball')) {
    return { name: 'MLB Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=MLB%20Network&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('nhl') || normalized.includes('hockey')) {
    return { name: 'NHL Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NHL%20Network&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('wimbledon') || normalized.includes('us open') || normalized.includes('atp') || normalized.includes('tennis')) {
    return { name: 'Sky Sports Tennis', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('epl') || normalized.includes('premier league') || normalized.includes('england')) {
    return { name: 'Sky Sports Premier League', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Premier%20League&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('ao') || normalized.includes('australian')) {
    return { name: 'Stan Sport 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('fina') || normalized.includes('afcon') || normalized.includes('caf') || normalized.includes('spl') || normalized.includes('ligue 1')) {
    return { name: 'beIN SPORTS', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('bellator')) {
    return { name: 'Bellator MMA', type: 'hls', url: 'https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8' };
  }
  if (normalized.includes('pga') || normalized.includes('ipl') || normalized.includes('golf') || normalized.includes('cricket')) {
    return { name: 'PGA Tour', type: 'hls', url: 'https://pb-783hpus5r91wv.akamaized.net/playlist.m3u8' };
  }
  if (normalized.includes('icc') || normalized.includes('world cup')) {
    return { name: 'DAZN 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('fivb') || normalized.includes('volleyball')) {
    return { name: 'beIN SPORTS', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('uel') || normalized.includes('europa') || normalized.includes('libertadores')) {
    return { name: 'TNT Sports 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%201&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('one fc') || normalized.includes('wnba') || normalized.includes('euroleague')) {
    return { name: 'beIN SPORTS MENA 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%20MENA%201&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('nascar') || normalized.includes('moto gp') || normalized.includes('motorsport') || normalized.includes('f1') || normalized.includes('formula 1')) {
    return { name: 'Sky Sports F1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20F1&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('laliga') || normalized.includes('spain')) {
    return { name: 'LaLiga TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=LaLiga%20TV&code=gb&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('nfl') || normalized.includes('football')) {
    return { name: 'NFL Channel', type: 'hls', url: 'https://pb-we3ltka9xobj6.akamaized.net/master.m3u8' };
  }
  if (normalized.includes('ucl') || normalized.includes('champions league') || normalized.includes('bundesliga')) {
    return { name: 'DAZN 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=de&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('ufc') || normalized.includes('mma')) {
    return { name: 'ESPN', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('eredivisie') || normalized.includes('netherlands')) {
    return { name: 'Ziggo Sport 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Ziggo%20Sport%201&code=nl&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('seria a') || normalized.includes('italy')) {
    return { name: 'DAZN 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=it&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('super rugby') || normalized.includes('rugby')) {
    return { name: 'RugbyPass TV', type: 'hls', url: 'https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8' };
  }
  if (normalized.includes('athletics') || normalized.includes('track')) {
    return { name: 'Peacock', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Peacock%20Event%201&code=us&user=cdnlivetv&plan=free' };
  }
  if (normalized.includes('tdf') || normalized.includes('cycling')) {
    return { name: 'USA Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free' };
  }
  
  // Default fallback
  return { name: 'ESPN', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free' };
};
