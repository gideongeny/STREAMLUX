export const LEAGUE_STREAMS: Record<string, { title: string; type: 'iframe' | 'hls'; src: string }> = {
  nba: {
    title: "NBA TV - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free"
  },
  wwe: {
    title: "WWE - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=WWE&code=us&user=cdnlivetv&plan=free"
  },
  mlb: {
    title: "MLB Network - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=MLB%20Network&code=us&user=cdnlivetv&plan=free"
  },
  wimbledon: {
    title: "Sky Sports Main Event - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Main%20Event&code=gb&user=cdnlivetv&plan=free"
  },
  f1: {
    title: "Sky Sports F1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20F1&code=gb&user=cdnlivetv&plan=free"
  },
  epl: {
    title: "Sky Sports Premier League - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Premier%20League&code=gb&user=cdnlivetv&plan=free"
  },
  'australian-open': {
    title: "Stan Sport 2 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free"
  },
  swimming: {
    title: "beIN SPORTS - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free"
  },
  bellator: {
    title: "Bellator MMA - Live Stream",
    type: "hls",
    src: "https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8"
  },
  nhl: {
    title: "NHL Network - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=NHL%20Network&code=us&user=cdnlivetv&plan=free"
  },
  'pga-tour': {
    title: "PGA Tour - Live Stream",
    type: "hls",
    src: "https://pb-783hpus5r91wv.akamaized.net/playlist.m3u8"
  },
  ipl: {
    title: "PGA Tour - Live Stream", // User requested same for IPL
    type: "hls",
    src: "https://pb-783hpus5r91wv.akamaized.net/playlist.m3u8"
  },
  'us-open-tennis': {
    title: "Sky Sports Tennis - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free"
  },
  'icc-world-cup': {
    title: "Sky Sports Tennis - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free"
  },
  fivb: {
    title: "beIN SPORTS - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free"
  },
  uel: {
    title: "TNT Sports 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%201&code=gb&user=cdnlivetv&plan=free"
  },
  ligue1: {
    title: "beIN SPORTS 2 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%202&code=us&user=cdnlivetv&plan=free"
  },
  'one-championship': {
    title: "beIN SPORTS MENA 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%20MENA%201&code=us&user=cdnlivetv&plan=free"
  },
  nascar: {
    title: "FOX Sports 2 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=FOX%20Sports%202&code=us&user=cdnlivetv&plan=free"
  },
  laliga: {
    title: "LaLiga TV - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=LaLiga%20TV&code=gb&user=cdnlivetv&plan=free"
  },
  nfl: {
    title: "NFL Channel - Live Stream",
    type: "hls",
    src: "https://pb-we3ltka9xobj6.akamaized.net/master.m3u8"
  },
  wnba: {
    title: "beIN SPORTS MENA 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%20MENA%201&code=us&user=cdnlivetv&plan=free"
  },
  euroleague: {
    title: "beIN SPORTS MENA 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%20MENA%201&code=us&user=cdnlivetv&plan=free"
  },
  ucl: {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=es&user=cdnlivetv&plan=free"
  },
  'copa-libertadores': {
    title: "TNT Sports - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports&code=ar&user=cdnlivetv&plan=free"
  },
  ufc: {
    title: "ESPN - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free"
  },
  bundesliga: {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=de&user=cdnlivetv&plan=free"
  },
  eredivisie: {
    title: "Ziggo Sport 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Ziggo%20Sport%201&code=nl&user=cdnlivetv&plan=free"
  },
  seriea: {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=it&user=cdnlivetv&plan=free"
  },
  'super-rugby': {
    title: "Stan Sport 2 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free"
  },
  'scottish-prem': {
    title: "beIN SPORTS 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%201&code=sa&user=cdnlivetv&plan=free"
  },
  afcon: {
    title: "beIN SPORTS 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%201&code=sa&user=cdnlivetv&plan=free"
  },
  athletics: {
    title: "Peacock Event 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=Peacock%20Event%201&code=us&user=cdnlivetv&plan=free"
  },
  'tour-de-france': {
    title: "USA Network - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free"
  },
  boxing: {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free"
  },
  esports: {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free"
  },
  'rugby-world-cup': {
    title: "RugbyPass TV - Live Stream",
    type: "hls",
    src: "https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8"
  },
  'six-nations': {
    title: "RugbyPass TV - Live Stream",
    type: "hls",
    src: "https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8"
  },
  'the-masters': {
    title: "GOLF TV - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=GOLF%20TV&code=us&user=cdnlivetv&plan=free"
  },
  'world-cup': {
    title: "DAZN 1 - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=gb&user=cdnlivetv&plan=free"
  },
  'caf-cl': {
    title: "beIN SPORTS - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS&code=us&user=cdnlivetv&plan=free"
  },
  motogp: {
    title: "FOX Sports - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=FOX%20Sports&code=mx&user=cdnlivetv&plan=free"
  },
  // Default fallbacks
  default_espn: {
    title: "ESPN - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free"
  },
  default_fox: {
    title: "FOX Sports - Live Stream",
    type: "iframe",
    src: "https://cdn-live.tv/api/v1/channels/player/?name=FOX%20Sports&code=us&user=cdnlivetv&plan=free"
  }
};
