export const API_URL = "https://api.themoviedb.org/3";
export const IMAGE_URL = "https://image.tmdb.org/t/p";
export const EMBED_URL = "https://2embed.org/embed";
export const EMBED_VIDSRC = "https://vidsrc.me/embed";
export const EMBED_TO = "https://www.2embed.to/embed/tmdb";

// Alternative video streaming services as fallbacks
export const EMBED_ALTERNATIVES = {
  VIDSRC: "https://vidsrc.me/embed",
  // New video sources - added after VIDSRC
  VIDSRC_ME: "https://vidsrc.me/embed",
  FSAPI: "https://fsapi.xyz",
  CURTSTREAM: "https://curtstream.com",
  MOVIEWP: "https://moviewp.com",
  APIMDB: "https://v2.apimdb.net/e",
  GOMO: "https://gomo.to",
  VIDCLOUD: "https://vidcloud.stream",
  GETSUPEREMBED: "https://getsuperembed.link",
  GODRIVEPLAYER: "https://databasegdriveplayer.co",
  ONETWOTHREEMOVIES: "https://123movies.com",
  FMOVIES_NEW: "https://fmovies.to",
  YESMOVIES: "https://yesmovies.to",
  GOMOVIES: "https://gomovies.sx",
  TWOEMBED: "https://2embed.org/embed",
  EMBEDTO: "https://www.2embed.to/embed/tmdb",
  VIDEMBED: "https://vidembed.cc",
  MOVIEBOX: "https://moviebox.live",
  WATCHMOVIES: "https://watchmovieshd.ru",
  STREAMSB: "https://streamsb.net",
  VIDSTREAM: "https://vidstream.pro",
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
  UPCLOUD: "https://upcloud.com",
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
  streamSources?: string[];
  extraInfo?: string;
  homeScore?: number;
  awayScore?: number;
  minute?: string;
  isLive?: boolean;
  matchId?: string; // For linking to sportslive.run
}

export const SPORTS_LEAGUES: SportsLeagueConfig[] = [
  {
    id: "epl",
    name: "English Premier League",
    shortName: "EPL",
    country: "England",
    flag: "🏴",
    primaryColor: "#38003c",
  },
  {
    id: "ucl",
    name: "UEFA Champions League",
    shortName: "UCL",
    country: "Europe",
    flag: "⭐",
    primaryColor: "#0b2144",
  },
  {
    id: "laliga",
    name: "La Liga",
    shortName: "La Liga",
    country: "Spain",
    flag: "🇪🇸",
    primaryColor: "#00529f",
  },
  {
    id: "ligue1",
    name: "Ligue 1",
    shortName: "Ligue 1",
    country: "France",
    flag: "🇫🇷",
    primaryColor: "#001c3d",
  },
  {
    id: "seriea",
    name: "Serie A",
    shortName: "Serie A",
    country: "Italy",
    flag: "🇮🇹",
    primaryColor: "#008fd2",
  },
  {
    id: "afcon",
    name: "Africa Cup of Nations",
    shortName: "AFCON",
    country: "Africa",
    flag: "🌍",
    primaryColor: "#009639",
  },
  {
    id: "rugby-world-cup",
    name: "Rugby World Cup",
    shortName: "Rugby WC",
    country: "World",
    flag: "🏉",
    primaryColor: "#1b5e20",
  },
  {
    id: "six-nations",
    name: "Six Nations Championship",
    shortName: "Six Nations",
    country: "Europe",
    flag: "🏴 🇮🇪 🏴",
    primaryColor: "#0d47a1",
  },
  {
    id: "ufc",
    name: "Ultimate Fighting Championship",
    shortName: "UFC",
    country: "World",
    flag: "🥊",
    primaryColor: "#b71c1c",
  },
  {
    id: "wwe",
    name: "WWE Premium Live Events",
    shortName: "WWE",
    country: "World",
    flag: "🤼",
    primaryColor: "#212121",
  },
  {
    id: "athletics",
    name: "World Athletics / Diamond League",
    shortName: "Athletics",
    country: "World",
    flag: "🏃",
    primaryColor: "#4a148c",
  },
];

export const SPORTS_FIXTURES: SportsFixtureConfig[] = [
  {
    id: "ucl-final-mci-rma",
    leagueId: "ucl",
    homeTeam: "Manchester City",
    awayTeam: "Real Madrid",
    homeTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/manchester-city.png",
    awayTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/real-madrid.png",
    status: "live",
    kickoffTimeFormatted: "Tonight · 21:00 (Your local time)",
    venue: "Wembley Stadium, London",
    round: "Final",
    referee: "UEFA Elite Referee",
    broadcast: ["DStv SuperSport", "beIN Sports", "Canal+"],
    streamSources: [
      "https://sportslive.run/", // general Champions League aggregator
      "https://streamed.pk/", // multi-sport live index (football category)
    ],
    extraInfo:
      "Multi‑angle camera support recommended. For the best experience, use a stable broadband connection.",
    homeScore: 2,
    awayScore: 1,
    minute: "67'",
    isLive: true,
  },
  {
    id: "epl-ars-che",
    leagueId: "epl",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    homeTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/arsenal.png",
    awayTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/chelsea.png",
    status: "live",
    kickoffTimeFormatted: "Saturday · 18:30 (Your local time)",
    venue: "Emirates Stadium, London",
    round: "Matchweek 12",
    broadcast: ["Sky Sports", "DStv SuperSport"],
    streamSources: [
      "https://sportslive.run/", // EPL live matches
      "https://streamed.pk/", // football section
    ],
    extraInfo:
      "Stream will unlock 15 minutes before kick‑off once the broadcaster feed is configured.",
    homeScore: 1,
    awayScore: 0,
    minute: "23'",
    isLive: true,
  },
  {
    id: "laliga-elclasico",
    leagueId: "laliga",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    homeTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/barcelona.png",
    awayTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/real-madrid.png",
    status: "live",
    kickoffTimeFormatted: "Live Now",
    venue: "Spotify Camp Nou, Barcelona",
    round: "Matchweek 27",
    broadcast: ["LaLigaTV", "beIN Sports"],
    streamSources: ["https://sportslive.run/", "https://streamed.pk/"],
    homeScore: 0,
    awayScore: 2,
    minute: "45'",
    isLive: true,
  },
  {
    id: "afcon-final",
    leagueId: "afcon",
    homeTeam: "Nigeria",
    awayTeam: "Senegal",
    homeTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/nigeria.png",
    awayTeamLogo: "https://www.thesportsdb.com/images/media/team/badge/senegal.png",
    status: "live",
    kickoffTimeFormatted: "Live Now",
    venue: "Abidjan, Côte d'Ivoire",
    round: "Final",
    broadcast: ["DStv SuperSport", "StarTimes"],
    streamSources: ["https://sportslive.run/", "https://streamed.pk/"],
    extraInfo:
      "Celebrating African football. Add your AFCON streams, highlights and analysis shows here.",
    homeScore: 1,
    awayScore: 1,
    minute: "78'",
    isLive: true,
  },
  {
    id: "rugby-wc-final",
    leagueId: "rugby-world-cup",
    homeTeam: "South Africa",
    awayTeam: "New Zealand",
    status: "replay",
    kickoffTimeFormatted: "Replay • Full match",
    venue: "Stade de France, Paris",
    round: "Final",
    broadcast: ["SuperSport Rugby", "ITV"],
    streamSources: [
      "https://sportslive.run/", // rugby matches
      "https://streamed.pk/", // rugby category
    ],
    extraInfo:
      "Rugby fans can enjoy full‑match replays and highlights here once streams are configured.",
  },
  {
    id: "six-nations-eng-ire",
    leagueId: "six-nations",
    homeTeam: "England",
    awayTeam: "Ireland",
    status: "upcoming",
    kickoffTimeFormatted: "Next weekend · 17:00 (Your local time)",
    venue: "Twickenham Stadium, London",
    round: "Round 3",
    broadcast: ["ITV", "SuperSport Rugby"],
    streamSources: [
      "https://sportslive.run/", // rugby matches
      "https://streamed.pk/", // rugby category
    ],
  },
  {
    id: "ufc-ppv-main",
    leagueId: "ufc",
    homeTeam: "Champion",
    awayTeam: "Challenger",
    status: "upcoming",
    kickoffTimeFormatted: "Saturday night · Main card",
    venue: "T-Mobile Arena, Las Vegas",
    round: "Main Event",
    broadcast: ["ESPN+", "UFC Fight Pass"],
    streamSources: [
      "https://sportslive.run/", // UFC/MMA events
      "https://streamed.pk/", // fight/UFC section
    ],
    extraInfo:
      "Add your official UFC Pay‑Per‑View or Fight Pass embeds here. Respect all regional and licensing restrictions.",
  },
  {
    id: "wwe-ppv-main",
    leagueId: "wwe",
    homeTeam: "Superstar A",
    awayTeam: "Superstar B",
    status: "replay",
    kickoffTimeFormatted: "Replay • Main event",
    venue: "AT&T Stadium, Texas",
    round: "Main Event",
    broadcast: ["WWE Network", "Peacock"],
    streamSources: [
      "https://sportslive.run/", // WWE events
      "https://streamed.pk/", // wrestling section
    ],
  },
  {
    id: "athletics-diamond-100m",
    leagueId: "athletics",
    homeTeam: "Men's 100m Final",
    awayTeam: "World’s fastest sprinters",
    status: "replay",
    kickoffTimeFormatted: "Replay • Finals",
    venue: "Diamond League Meeting",
    round: "Final",
    broadcast: ["World Athletics", "SuperSport"],
    streamSources: [
      "https://sportslive.run/", // athletics events
      "https://streamed.pk/", // athletics/other
    ],
    extraInfo:
      "Use this slot for live track & field, marathons or Diamond League meets with your official streams.",
  },
];
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
