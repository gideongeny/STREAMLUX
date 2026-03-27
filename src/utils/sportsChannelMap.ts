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
  { name: 'FOX Sports MX', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=FOX%20Sports&code=mx&user=cdnlivetv&plan=free' },
  { name: 'CBS Sports', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=CBS%20Sports%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'NBA TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free' },
  { name: 'NFL Network', type: 'hls', url: 'https://pb-we3ltka9xobj6.akamaized.net/master.m3u8' },
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
  { name: 'TNT Sports AR', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports&code=ar&user=cdnlivetv&plan=free' },
  { name: 'beIN SPORTS', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free' },
  { name: 'beIN SPORTS 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%202&code=us&user=cdnlivetv&plan=free' },
  { name: 'beIN SPORTS 1 (SA)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%201&code=sa&user=cdnlivetv&plan=free' },
  { name: 'beIN SPORTS MENA 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%20MENA%201&code=us&user=cdnlivetv&plan=free' },
  { name: 'DAZN 1 (DE)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=de&user=cdnlivetv&plan=free' },
  { name: 'DAZN 1 (ES)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=es&user=cdnlivetv&plan=free' },
  { name: 'DAZN 1 (IT)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=it&user=cdnlivetv&plan=free' },
  { name: 'DAZN 1 (GB)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free' },
  { name: 'LaLiga TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=LaLiga%20TV&code=gb&user=cdnlivetv&plan=free' },
  { name: 'Stan Sport 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free' },
  { name: 'Ziggo Sport 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Ziggo%20Sport%201&code=nl&user=cdnlivetv&plan=free' },
  { name: 'USA Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free' },
  { name: 'Peacock Event 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Peacock%20Event%201&code=us&user=cdnlivetv&plan=free' },
  { name: 'GOLF TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=GOLF%20TV&code=us&user=cdnlivetv&plan=free' },
  { name: 'WWE Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=WWE&code=us&user=cdnlivetv&plan=free' },
  { name: 'RugbyPass TV', type: 'hls', url: 'https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8' },
  { name: 'PGA Tour', type: 'hls', url: 'https://pb-783hpus5r91wv.akamaized.net/playlist.m3u8' },
  { name: 'Bellator MMA', type: 'hls', url: 'https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8' },
  { name: '123HD - ESPN', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/espn.php?' },
  { name: '123HD - ESPN 2', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/espn2.php?' },
  { name: '123HD - TNT', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/tnt.php?' },
  { name: '123HD - NBA TV', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/nba.php?' },
  { name: '123HD - FS1', type: 'iframe', url: 'https://cdnb.123hdtv.com/server/fs1.php?' },
];

export const getFallbackChannel = (leagueId: string): SportsChannel => {
  const normalized = leagueId?.toLowerCase() || '';

  if (normalized.includes('nba') || normalized.includes('basketball') || normalized.includes('euroleague') || normalized.includes('ncaa'))
    return { name: 'NBA TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('wwe') || normalized.includes('wrestling'))
    return { name: 'WWE Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=WWE&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('mlb') || normalized.includes('baseball'))
    return { name: 'MLB Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=MLB%20Network&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('nhl') || normalized.includes('hockey'))
    return { name: 'NHL Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NHL%20Network&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('wimbledon') || normalized.includes('us open') || normalized.includes('atp') || normalized.includes('tennis'))
    return { name: 'Sky Sports Tennis', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('epl') || normalized.includes('premier league') || normalized.includes('england'))
    return { name: 'Sky Sports Premier League', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Premier%20League&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('ao') || normalized.includes('australian'))
    return { name: 'Stan Sport 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free' };

  if (normalized.includes('fina') || normalized.includes('afcon') || normalized.includes('caf') || normalized.includes('spl') || normalized.includes('fivb') || normalized.includes('volleyball'))
    return { name: 'beIN SPORTS 1 (SA)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%201&code=sa&user=cdnlivetv&plan=free' };

  if (normalized.includes('ligue 1') || normalized.includes('ligue1'))
    return { name: 'beIN SPORTS 2', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%202&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('bellator'))
    return { name: 'Bellator MMA', type: 'hls', url: 'https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8' };

  if (normalized.includes('pga') || normalized.includes('golf') || normalized.includes('masters'))
    return { name: 'GOLF TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=GOLF%20TV&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('ipl') || normalized.includes('cricket') || normalized.includes('ashes') || normalized.includes('icc'))
    return { name: 'Sky Sports Cricket', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Cricket&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('world cup') || normalized.includes('boxing') || normalized.includes('esport'))
    return { name: 'DAZN 1 (GB)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('uel') || normalized.includes('europa') || normalized.includes('one fc') || normalized.includes('wnba'))
    return { name: 'TNT Sports 1 (UK)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%201&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('libertadores'))
    return { name: 'TNT Sports AR', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports&code=ar&user=cdnlivetv&plan=free' };

  if (normalized.includes('nascar') || normalized.includes('moto gp') || normalized.includes('motogp') || normalized.includes('f1') || normalized.includes('formula'))
    return { name: 'Sky Sports F1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20F1&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('laliga') || normalized.includes('la liga') || normalized.includes('spain'))
    return { name: 'LaLiga TV', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=LaLiga%20TV&code=gb&user=cdnlivetv&plan=free' };

  if (normalized.includes('nfl') || normalized.includes('american football'))
    return { name: 'NFL Channel', type: 'hls', url: 'https://pb-we3ltka9xobj6.akamaized.net/master.m3u8' };

  if (normalized.includes('ucl') || normalized.includes('champions league') || normalized.includes('bundesliga'))
    return { name: 'DAZN 1 (DE)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=de&user=cdnlivetv&plan=free' };

  if (normalized.includes('seriea') || normalized.includes('serie a') || normalized.includes('italy'))
    return { name: 'DAZN 1 (IT)', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=it&user=cdnlivetv&plan=free' };

  if (normalized.includes('ufc') || normalized.includes('mma'))
    return { name: 'ESPN', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('eredivisie') || normalized.includes('netherlands'))
    return { name: 'Ziggo Sport 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Ziggo%20Sport%201&code=nl&user=cdnlivetv&plan=free' };

  if (normalized.includes('rugby') || normalized.includes('six nations'))
    return { name: 'RugbyPass TV', type: 'hls', url: 'https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8' };

  if (normalized.includes('athletics') || normalized.includes('track'))
    return { name: 'Peacock Event 1', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Peacock%20Event%201&code=us&user=cdnlivetv&plan=free' };

  if (normalized.includes('tdf') || normalized.includes('tour de france') || normalized.includes('cycling'))
    return { name: 'USA Network', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free' };

  // Default fallback
  return { name: 'ESPN', type: 'iframe', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free' };
};

/**
 * Creates a clean slug for a match (e.g., 'manchester-united-vs-liverpool')
 */
export const generateMatchSlug = (home: string, away: string): string => {
  const clean = (s: string) => 
    s?.toLowerCase()
     .replace(/[^a-z0-9\s]/g, '')
     .replace(/\s+/g, '-') || 'team';
  
  if (!away || away.trim() === '') return clean(home);
  return `${clean(home)}-vs-${clean(away)}`;
};

/**
 * Returns match-specific streaming sources (RiveStream-style)
 */
export const getDynamicMatchSources = (match: { homeTeam: string; awayTeam: string; id: string; sport?: string }): SportsChannel[] => {
  const slug = generateMatchSlug(match.homeTeam, match.awayTeam);
  const encodedTitle = encodeURIComponent(`${match.homeTeam} vs ${match.awayTeam}`);
  const matchId = match.id;
  
  return [
    { 
      name: 'Server 1 (Auto Elite)', 
      type: 'iframe', 
      url: `https://vidsrc.me/embed/sports/${slug}` 
    },
    { 
        name: 'Server 2 (Method VIP)', 
        type: 'iframe', 
        url: `https://vidsrc.xyz/embed/sports/${slug}` 
    },
    { 
        name: 'Server 3 (Rive Stream)', 
        type: 'iframe', 
        url: `https://rivestream.org/embed/sports?title=${encodedTitle}` 
    },
    { 
        name: 'Server 4 (Global)', 
        type: 'iframe', 
        url: `https://embed.smashystream.com/playjs_sports.php?id=${matchId}` 
    }
  ];
};
