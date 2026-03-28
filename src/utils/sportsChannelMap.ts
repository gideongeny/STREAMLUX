export interface SportsChannel {
  name: string;
  type: 'iframe' | 'hls';
  url: string;
  isExternal?: boolean; // If true, this mirror restricts iframes/embedding
}

export const ALL_SPORTS_CHANNELS: SportsChannel[] = [
  { name: 'ESPN', type: 'iframe', url: 'https://dlhd.so/embed/stream-41.php' },
  { name: 'ESPN 2', type: 'iframe', url: 'https://dlhd.so/embed/stream-42.php' },
  { name: 'TNT (US)', type: 'iframe', url: 'https://dlhd.so/embed/stream-46.php' },
  { name: 'Fox Sports 1', type: 'iframe', url: 'https://dlhd.so/embed/stream-43.php' },
  { name: 'Fox Sports 2', type: 'iframe', url: 'https://dlhd.so/embed/stream-44.php' },
  { name: 'NBA TV', type: 'iframe', url: 'https://dlhd.so/embed/stream-47.php' },
  { name: 'NFL Network', type: 'iframe', url: 'https://dlhd.so/embed/stream-49.php' },
  { name: 'MLB Network', type: 'iframe', url: 'https://dlhd.so/embed/stream-51.php' },
  { name: 'Sky Sports Premier League', type: 'iframe', url: 'https://dlhd.so/embed/stream-1.php' },
  { name: 'Sky Sports Main Event', type: 'iframe', url: 'https://dlhd.so/embed/stream-2.php' },
  { name: 'Sky Sports Football', type: 'iframe', url: 'https://dlhd.so/embed/stream-3.php' },
  { name: 'Sky Sports F1', type: 'iframe', url: 'https://dlhd.so/embed/stream-5.php' },
  { name: 'TNT Sports 1 (UK)', type: 'iframe', url: 'https://dlhd.so/embed/stream-7.php' },
  { name: 'TNT Sports 2 (UK)', type: 'iframe', url: 'https://dlhd.so/embed/stream-8.php' },
  { name: 'beIN SPORTS (US)', type: 'iframe', url: 'https://dlhd.so/embed/stream-54.php' },
  { name: 'beIN SPORTS 1 (MENA)', type: 'iframe', url: 'https://dlhd.so/embed/stream-11.php' },
  { name: 'DAZN 1 (UK)', type: 'iframe', url: 'https://dlhd.so/embed/stream-16.php' },
  { name: 'LaLiga TV', type: 'iframe', url: 'https://dlhd.so/embed/stream-18.php' },
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
 * Returns match-specific streaming sources (RiveStream-style 'World Class' Servers)
 * Now maps matches to the highest probability 24/7 channels based on league/sport
 */
export const getDynamicMatchSources = (match: { homeTeam: string; awayTeam: string; leagueName?: string; sport?: string }): SportsChannel[] => {
  const league = match.leagueName?.toLowerCase() || '';
  const sport = match.sport?.toLowerCase() || '';
  
  const sources: SportsChannel[] = [];

  // Match Intelligence: Map common leagues to their primary broadcasting networks
  if (league.includes('premier league') || league.includes('epl')) {
    sources.push({ name: 'Server 1 (Sky Sports)', type: 'iframe', url: 'https://dlhd.so/embed/stream-1.php' });
    sources.push({ name: 'Server 2 (Premier League)', type: 'iframe', url: 'https://dlhd.so/embed/stream-3.php' });
  } else if (league.includes('champions league') || league.includes('ucl') || league.includes('europa')) {
    sources.push({ name: 'Server 1 (TNT Sports)', type: 'iframe', url: 'https://dlhd.so/embed/stream-7.php' });
    sources.push({ name: 'Server 2 (beIN 1)', type: 'iframe', url: 'https://dlhd.so/embed/stream-11.php' });
  } else if (league.includes('nba') || sport.includes('basketball')) {
    sources.push({ name: 'Server 1 (NBA TV)', type: 'iframe', url: 'https://dlhd.so/embed/stream-47.php' });
    sources.push({ name: 'Server 2 (ESPN)', type: 'iframe', url: 'https://dlhd.so/embed/stream-41.php' });
  } else if (league.includes('nfl') || sport.includes('american football')) {
    sources.push({ name: 'Server 1 (NFL Net)', type: 'iframe', url: 'https://dlhd.so/embed/stream-49.php' });
  } else if (sport.includes('ufc') || sport.includes('mma') || sport.includes('boxing')) {
    sources.push({ name: 'Server 1 (ESPN)', type: 'iframe', url: 'https://dlhd.so/embed/stream-41.php' });
    sources.push({ name: 'Server 2 (BT Sport)', type: 'iframe', url: 'https://dlhd.so/embed/stream-7.php' });
  } else if (league.includes('laliga') || league.includes('spain')) {
    sources.push({ name: 'Server 1 (LaLiga TV)', type: 'iframe', url: 'https://dlhd.so/embed/stream-18.php' });
  }

  // Universal Fallbacks - The "Best World Streams" that usually cover any global fixture
  const worldClass: SportsChannel[] = [
    { name: 'Server 3 (World Sports)', type: 'iframe', url: 'https://dlhd.so/embed/stream-41.php' }, // ESPN
    { name: 'Server 4 (Global Elite)', type: 'iframe', url: 'https://dlhd.so/embed/stream-1.php' },  // Sky
    { name: 'Server 5 (International)', type: 'iframe', url: 'https://dlhd.so/embed/stream-54.php' } // beIN
  ];

  // Merge unique sources
  worldClass.forEach(w => {
    if (!sources.some(s => s.url === w.url)) sources.push(w);
  });

  return sources;
};

/**
 * Intelligent StreamEast Slug Generator
 * Handles specific sports categories and naming patterns found on StreamEast mirrors.
 */
export const generateStreamEastSlug = (home: string, away: string, sport?: string): string => {
  const clean = (s: string) => 
    s?.toLowerCase()
     .replace(/[^a-z0-9\s]/g, '')
     .replace(/\s+/g, '-') || 'team';
  
  const homeSlug = clean(home);
  const awaySlug = clean(away);
  const sportLower = sport?.toLowerCase() || '';

  // Specialized patterns for certain sports
  if (sportLower.includes('basketball') || sportLower.includes('nba')) {
    return `${homeSlug}-vs-${awaySlug}-1`; // NBA often ends in -1
  }

  if (sportLower.includes('f1') || sportLower.includes('racing')) {
    return `${homeSlug}-grand-prix`;
  }

  return `${homeSlug}-vs-${awaySlug}`;
};

/**
 * Maps internal sport names to StreamEast categories
 */
export const getStreamEastCategory = (sport: string): string => {
  const s = sport?.toLowerCase() || 'soccer';
  if (s.includes('football')) return 'soccer';
  if (s.includes('basketball')) return 'nba';
  if (s.includes('racing')) return 'f1';
  if (s.includes('baseball')) return 'mlb';
  if (s.includes('hockey')) return 'nhl';
  if (s.includes('fighting') || s.includes('ufc') || s.includes('mma')) return 'ufc';
  return s;
};

/**
 * Returns prioritized StreamEast mirrors for a specific match.
 * Rotates through 13 verified mirrors and tries multiple slug variations (-1, -2).
 * Zero-input 'Intelligence' for mirror rotation and URL fallback.
 */
export const getStreamEastSources = (match: { homeTeam: string; awayTeam: string; sport?: string }): SportsChannel[] => {
  const baseSlug = generateStreamEastSlug(match.homeTeam, match.awayTeam, match.sport);
  const cat = getStreamEastCategory(match.sport || '');
  
  // 13 Verified Mirrors (as of March 2026)
  const MIRRORS = ['su', 'ms', 'ps', 'ga', 'cf', 'ch', 'ec', 'fi', 'ph', 'sg', 'sk', 'ru', 'link'];
  
  const sources: SportsChannel[] = [];

  // --- Add Global Safe Fallback (ESPN) ---
  sources.push({
    name: 'Safe Channel (ESPN)',
    type: 'iframe',
    url: 'https://dlhd.so/embed/stream-41.php', // High-stability ESPN source
  });

  // Try standard slugs on the most stable mirrors first
  ['ph', 'ch', 'ms'].forEach(tld => {
    sources.push({
      name: `Mirror Alpha (.${tld})`,
      type: 'iframe',
      url: `https://www.streameast.${tld}/${cat}/${baseSlug}/`,
      isExternal: true
    });
  });

  // Try suffix variants (-1)
  ['ph', 'ch', 'ms'].forEach(tld => {
    sources.push({
      name: `Mirror Beta (.${tld})`,
      type: 'iframe',
      url: `https://www.streameast.${tld}/${cat}/${baseSlug}-1/`,
      isExternal: true
    });
  });

  // Add all other mirrors as additional fallbacks
  MIRRORS.slice(3).forEach(tld => {
    const domain = tld === 'link' ? 'v4.gostreameast.link' : `www.streameast.${tld}`;
    sources.push({
      name: `Mirror Delta (.${tld})`,
      type: 'iframe',
      url: `https://${domain}/${cat}/${baseSlug}/`,
      isExternal: true
    });
  });

  return sources;
};

/**
 * Returns a high-reliability 'Safe Channel' (ESPN) for any sport
 * Used as a catch-all fallback when all other mirrors/servers fail.
 */
export const getSafeChannel = (): SportsChannel => {
  return {
    name: 'Safe Channel (ESPN)',
    type: 'iframe',
    url: 'https://dlhd.so/embed/stream-41.php'
  };
};
