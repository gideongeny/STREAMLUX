// Redirect legacy TMDB calls to our unified proxy by default
export const API_URL = "/api/proxy/tmdb"; 
export const IMAGE_URL = "https://image.tmdb.org/t/p";
export const EMBED_URL = "https://2embed.org/embed";
export const EMBED_VIDSRC = "https://vidsrc.me/embed";
export const EMBED_TO = "https://www.2embed.to/embed/tmdb";

// Video streaming services - Only known working sources
export const EMBED_ALTERNATIVES = {
  // Primary sources - Most reliable
  VIDSRC: "https://vidsrc.me/embed",
  VIDSRC_ME: "https://vidsrc.me/embed",
  VIDSRC_TO: "https://vidsrc.to/embed",
  VIDSRC_PRO: "https://vidsrc.pro/embed",

  // Secondary sources - Known working
  VIDPLAY: "https://vidplay.online/e",
  UPCLOUD: "https://upcloud.to/e",
  VIDCLOUD: "https://vidcloud.stream",

  // Additional reliable sources
  APIMDB: "https://v2.apimdb.net/e",
  EMBEDTO: "https://www.2embed.to/embed/tmdb",
  TWOEMBED: "https://2embed.org/embed",
  AUTOEMBED: "https://player.autoembed.cc/embed",
  VIDLINK: "https://vidlink.pro",
  // African and non-Western content sources - Updated with working alternatives
  AFRIKAN: "https://afrikan.tv",
  NOLLYWOOD: "https://nollywood.tv",
  BOLLYWOOD: "https://bollywood.tv",
  ASIAN: "https://asian.tv",
  LATINO: "https://latino.tv",
  ARABIC: "https://arabic.tv",
  // Additional working sources for African content
  AFRIKANFLIX: "https://afrikanflix.com",
  NOLLYWOODPLUS: "https://nollywoodplus.com",
  AFRICANMOVIES: "https://africanmovies.net",
  KENYANFLIX: "https://kenyanflix.com",
  NIGERIANFLIX: "https://nigerianflix.com",
  // Additional working sources
  // TOP-TIER NEW WORKING EMBED SOURCES
  MULTIEMBED: "https://multiembed.mov",
  TWOEMBED_CC: "https://2embed.cc/embed",
  FLIXHQ: "https://flixhq.to/embed",
  VIDSRC_XYZ: "https://vidsrc.xyz/embed",
  SMASHYSTREAM: "https://embed.smashystream.com/playere.php",
  SMASHYSTREAM2: "https://smashystream.xyz/player.php",
  FREEK: "https://freek.to",
  EMBEDDER: "https://www.embedder.net/e",
  NONTONGO: "https://www.nontongo.win/embed",
  MOVICLOUD: "https://movicloud.me/embed",
  CINEMAHOLIC: "https://cinemaholic.com",
  MOVIEFREAK: "https://moviefreak.com",
  WATCHSERIES: "https://watchseries.to",
  PUTLOCKER: "https://putlocker.to",
  SOLARMOVIE: "https://solarmovie.to",
  FMOVIES: "https://fmovies.to",
  GOOGLE: "https://drive.google.com",
  MEGA: "https://mega.nz",
  // More reliable sources for international content
  MOVIECRITIC: "https://moviecritic.com",
  FILMDAILY: "https://filmdaily.co",
  SCREENRANT: "https://screenrant.com",
  COLLIDER: "https://collider.com",
  IGN: "https://ign.com",
  ROTTENTOMATOES: "https://rottentomatoes.com",
  IMDB: "https://imdb.com",
  METACRITIC: "https://metacritic.com",
  // Additional streaming platforms
  NETFLIX: "https://netflix.com",
  AMAZON: "https://amazon.com",
  DISNEY: "https://disneyplus.com",
  HBO: "https://hbomax.com",
  HULU: "https://hulu.com",
  APPLE: "https://tv.apple.com",
  YOUTUBE: "https://youtube.com",
  VIMEO: "https://vimeo.com",
  DAILYMOTION: "https://dailymotion.com",
  // Regional streaming services
  SHOWMAX: "https://showmax.com", // Popular in Africa
  IROKO: "https://irokotv.com", // Nigerian content
  BONGO: "https://bongotv.com", // Tanzanian content
  KWESE: "https://kwese.iflix.com", // Pan-African
  STARTIMES: "https://startimes.com", // African satellite TV
  DSTV: "https://dstv.com", // South African satellite TV
  GOTV: "https://gotvafrica.com", // African satellite TV
  // FZMovies CMS integration - primary source for movies and TV shows
  // Use proper embed formats
  FZMOVIES: "https://fzmovies.cms",
  FZMOVIES_EMBED: "https://fzmovies.cms/embed",
  FZMOVIES_PLAYER: "https://fzmovies.cms/player",
  FZMOVIES_WATCH: "https://fzmovies.cms/watch",
  // Additional FZMovies alternative endpoints
  FZMOVIES_ALT1: "https://fzmovies.net",
  FZMOVIES_ALT2: "https://fzmovies.watch",
  FZMOVIES_ALT3: "https://fzmovies.to",
  // New video sources - using proper embed formats
  YOUTUBE_EMBED: "https://www.youtube.com/embed",
  KISSKH: "https://kisskh.com",
  KISSKH_EMBED: "https://kisskh.com/embed",
  UGC_ANIME: "https://ugc-anime.com",
  UGC_ANIME_EMBED: "https://ugc-anime.com/embed",
  AILOK: "https://ailok.pe",
  AILOK_EMBED: "https://ailok.pe/embed",
  SZ_GOOGOTV: "https://sz.googotv.com",
  SZ_GOOGOTV_EMBED: "https://sz.googotv.com/embed",
  // Additional working sources for African content (industry-standard)
  NOLLYWOOD_TV: "https://nollywoodtv.com",
  AFRICAN_MOVIES_ONLINE: "https://africanmoviesonline.com",
  NOLLYWOOD_MOVIES: "https://nollywoodmovies.com",
  AFRIKAN_MOVIES: "https://afrikanmovies.com",
  // Additional working sources for Asian content (industry-standard)
  DRAMACOOL: "https://dramacool.com",
  KISSASIAN: "https://kissasian.com",
  ASIANSERIES: "https://asianseries.com",
  MYASIANTV: "https://myasiantv.com",
  VIKI: "https://viki.com",
  // Additional working sources for Latin American content
  CUEVANA: "https://cuevana.com",
  PELISPLUS: "https://pelisplus.com",
  REPELIS: "https://repelis.com",
  LATINOMOVIES: "https://latinomovies.com",
  // Additional working sources for Middle Eastern content
  SHAHID: "https://shahid.mbc.net",
  OSN: "https://osn.com",
  // Universal working sources (industry-standard)
  SUPEREMBED: "https://superembed.com",
  EMBEDMOVIE: "https://embedmovie.com",
  MOVIEAPI: "https://movieapi.com",
  STREAMTAPE: "https://streamtape.com",
  MIXDROP: "https://mixdrop.com",
  // Additional reliable embed sources
  EMBEDSB: "https://embedsb.com",
  STREAMWISH: "https://streamwish.com",
  FILEMOON: "https://filemoon.com",
  DOODSTREAM: "https://doodstream.com",
  // Regional-specific working sources
  ZEE5: "https://zee5.com", // Indian content
  HOTSTAR: "https://hotstar.com", // Indian content
  VIU: "https://viu.com", // Asian content
  IWANTTFC: "https://iwanttfc.com", // Filipino content
  ABS_CBN: "https://abs-cbn.com", // Filipino content
};

export interface SportsLeagueConfig {
  id: string;
  name: string;
  shortName: string;
  country?: string;
  flag?: string;
  primaryColor?: string;
}

export interface SportsFixtureConfig {
  id: string;
  leagueId: string;
  leagueName?: string;
  shortName?: string;
  country?: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  status: "live" | "upcoming" | "replay";
  kickoffTimeFormatted: string;
  venue: string;
  round?: string;
  referee?: string;
  broadcast?: string[];
  broadcastInfo?: string;
  streamSources?: string[];
  extraInfo?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  isLive?: boolean;
  matchId?: string; // For linking to sportslive.run
  banner?: string;
  thumb?: string;
  fanart?: string;
  poster_path?: string; // Added for variety compatibility
  title?: string; // Added for variety compatibility
  sportsCategory?: string; // Added for categorization
  youtubeId?: string; // Added for instant trailer playback
  isYouTube?: boolean; // Flag for YT content
  homeProb?: number;
  // Pro Stats & Details
  stats?: {
    possession?: string;
    shotsOnTarget?: number;
    totalShots?: number;
    corners?: number;
    yellowCards?: number;
    redCards?: number;
  };
  lineups?: {
    home?: any[];
    away?: any[];
  };
  events?: any[]; // Match timeline events
}

export const SPORTS_CHANNELS = [
  { id: "bein1", name: "beIN Sports 1", logo: "https://i.ibb.co/logo1.png", country: "Qatar" },
  { id: "bein2", name: "beIN Sports 2", logo: "https://i.ibb.co/logo2.png", country: "Qatar" },
  { id: "skysports", name: "Sky Sports", logo: "https://i.ibb.co/logo3.png", country: "UK" },
];

export const SPORTS_LEAGUES: SportsLeagueConfig[] = [
  // ⚽ FOOTBALL / SOCCER
  { id: "epl", name: "English Premier League", shortName: "EPL", country: "England", flag: "🏴", primaryColor: "#38003c" },
  { id: "ucl", name: "UEFA Champions League", shortName: "UCL", country: "Europe", flag: "⭐", primaryColor: "#0b2144" },
  { id: "uel", name: "UEFA Europa League", shortName: "UEL", country: "Europe", flag: "🟠", primaryColor: "#f47a23" },
  { id: "laliga", name: "La Liga", shortName: "La Liga", country: "Spain", flag: "🇪🇸", primaryColor: "#00529f" },
  { id: "bundesliga", name: "Bundesliga", shortName: "Bundesliga", country: "Germany", flag: "🇩🇪", primaryColor: "#d20515" },
  { id: "seriea", name: "Serie A", shortName: "Serie A", country: "Italy", flag: "🇮🇹", primaryColor: "#008fd2" },
  { id: "ligue1", name: "Ligue 1", shortName: "Ligue 1", country: "France", flag: "🇫🇷", primaryColor: "#001c3d" },
  { id: "eredivisie", name: "Eredivisie", shortName: "Eredivisie", country: "Netherlands", flag: "🇳🇱", primaryColor: "#e04f00" },
  { id: "mls", name: "Major League Soccer", shortName: "MLS", country: "USA", flag: "🇺🇸", primaryColor: "#002f6c" },
  { id: "afcon", name: "Africa Cup of Nations", shortName: "AFCON", country: "Africa", flag: "🌍", primaryColor: "#009639" },
  { id: "caf-cl", name: "CAF Champions League", shortName: "CAF CL", country: "Africa", flag: "🌍", primaryColor: "#00a651" },
  { id: "copa-libertadores", name: "Copa Libertadores", shortName: "Libertadores", country: "South America", flag: "🌎", primaryColor: "#1565c0" },
  { id: "world-cup", name: "FIFA World Cup", shortName: "World Cup", country: "World", flag: "🏆", primaryColor: "#002244" },
  { id: "scottish-prem", name: "Scottish Premiership", shortName: "SPL", country: "Scotland", flag: "🏴", primaryColor: "#003087" },
  // 🏀 BASKETBALL
  { id: "nba", name: "NBA", shortName: "NBA", country: "USA", flag: "🏀", primaryColor: "#c9082a" },
  { id: "euroleague", name: "EuroLeague Basketball", shortName: "EuroLeague", country: "Europe", flag: "🇪🇺", primaryColor: "#002366" },
  { id: "wnba", name: "WNBA", shortName: "WNBA", country: "USA", flag: "🏀", primaryColor: "#e56020" },
  // 🏈 AMERICAN SPORTS
  { id: "nfl", name: "NFL", shortName: "NFL", country: "USA", flag: "🏈", primaryColor: "#013369" },
  { id: "mlb", name: "Major League Baseball", shortName: "MLB", country: "USA", flag: "⚾", primaryColor: "#002d72" },
  { id: "nhl", name: "NHL Ice Hockey", shortName: "NHL", country: "USA", flag: "🏒", primaryColor: "#000000" },
  // 🥊 COMBAT SPORTS
  { id: "ufc", name: "Ultimate Fighting Championship", shortName: "UFC", country: "World", flag: "🥊", primaryColor: "#b71c1c" },
  { id: "bellator", name: "Bellator MMA", shortName: "Bellator", country: "World", flag: "🥊", primaryColor: "#e53935" },
  { id: "one-championship", name: "ONE Championship", shortName: "ONE FC", country: "Asia", flag: "🏆", primaryColor: "#f50029" },
  { id: "boxing", name: "World Championship Boxing", shortName: "Boxing", country: "World", flag: "🥊", primaryColor: "#212121" },
  { id: "wwe", name: "WWE Premium Live Events", shortName: "WWE", country: "World", flag: "🤼", primaryColor: "#212121" },
  // 🏎️ MOTOR RACING
  { id: "f1", name: "Formula 1", shortName: "F1", country: "World", flag: "🏎️", primaryColor: "#e10600" },
  { id: "motogp", name: "MotoGP", shortName: "MotoGP", country: "World", flag: "🏍️", primaryColor: "#cc0000" },
  { id: "nascar", name: "NASCAR Cup Series", shortName: "NASCAR", country: "USA", flag: "🏁", primaryColor: "#ffd700" },
  // 🏏 CRICKET
  { id: "ipl", name: "Indian Premier League", shortName: "IPL", country: "India", flag: "🇮🇳", primaryColor: "#004ba0" },
  { id: "icc-world-cup", name: "ICC Cricket World Cup", shortName: "ICC WC", country: "World", flag: "🏏", primaryColor: "#003366" },
  { id: "the-ashes", name: "The Ashes", shortName: "Ashes", country: "England/Australia", flag: "🏏", primaryColor: "#003366" },
  // 🎾 TENNIS
  { id: "wimbledon", name: "Wimbledon", shortName: "Wimbledon", country: "UK", flag: "🎾", primaryColor: "#194d38" },
  { id: "australian-open", name: "Australian Open", shortName: "AO", country: "Australia", flag: "🇦🇺", primaryColor: "#0066b2" },
  { id: "roland-garros", name: "Roland Garros", shortName: "RG", country: "France", flag: "🇫🇷", primaryColor: "#c24f1e" },
  { id: "us-open-tennis", name: "US Open Tennis", shortName: "US Open", country: "USA", flag: "🇺🇸", primaryColor: "#2d5fa0" },
  // 🏌️ GOLF
  { id: "pga-tour", name: "PGA Tour", shortName: "PGA", country: "USA", flag: "⛳", primaryColor: "#003087" },
  { id: "the-masters", name: "The Masters", shortName: "Masters", country: "USA", flag: "⛳", primaryColor: "#006747" },
  // 🏉 RUGBY
  { id: "rugby-world-cup", name: "Rugby World Cup", shortName: "Rugby WC", country: "World", flag: "🏉", primaryColor: "#1b5e20" },
  { id: "six-nations", name: "Six Nations Championship", shortName: "Six Nations", country: "Europe", flag: "🏴", primaryColor: "#0d47a1" },
  { id: "super-rugby", name: "Super Rugby", shortName: "Super Rugby", country: "World", flag: "🏉", primaryColor: "#00274c" },
  // 🏊 SWIMMING / ATHLETICS
  { id: "athletics", name: "World Athletics / Diamond League", shortName: "Athletics", country: "World", flag: "🏃", primaryColor: "#4a148c" },
  { id: "swimming", name: "FINA World Swimming Championships", shortName: "FINA", country: "World", flag: "🏊", primaryColor: "#006994" },
  // 🚴 CYCLING
  { id: "tour-de-france", name: "Tour de France", shortName: "TDF", country: "France", flag: "🚴", primaryColor: "#ffce00" },
  // 🏐 VOLLEYBALL
  { id: "fivb", name: "FIVB World Championships", shortName: "FIVB", country: "World", flag: "🏐", primaryColor: "#003087" },
  // 🎮 ESPORTS
  { id: "esports", name: "Esports & Gaming Events", shortName: "Esports", country: "World", flag: "🎮", primaryColor: "#6441a5" },
];

export const SPORTS_FIXTURES: SportsFixtureConfig[] = [];
export const reactionColorForTailwindCSS = {
  haha: "text-yellow-500",
  like: "text-primary",
  love: "text-red-500",
  angry: "text-orange-500",
  wow: "text-green-500",
  sad: "text-purple-500",
};

export const MAX_RUNTIME = 200;
export const GAP = 20;

// My purpose is to append search parameter to the url without replace the existing search parameter.

// I have 2 ways of doing that. The first way is not optimal

// this peace of code is of the first way. I could delete it but I'd like to keep it as a reference.

export const SUPPORTED_QUERY = {
  genre: [],
  sort_by: [],
  minRuntime: [],
  maxRuntime: [],
  from: [],
  to: [],
};
