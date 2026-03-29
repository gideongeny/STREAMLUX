export interface TVChannel {
  id: string;
  name: string;
  type: 'iframe' | 'hls';
  url: string;
  category: 'News' | 'Entertainment' | 'Sports' | 'Kids' | 'Lifestyle' | 'Music';
  logo?: string;
  isExternal?: boolean;
}

export const ALL_TV_CHANNELS: TVChannel[] = [
  // --- Major Networks ---
  { id: 'abc', name: 'ABC', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ABC&code=us&user=cdnlivetv&plan=free' },
  { id: 'bbc', name: 'BBC', type: 'iframe', category: 'News', url: 'https://cdn-live.tv/api/v1/channels/player/?name=BBC&code=us&user=cdnlivetv&plan=free' },
  { id: 'nbc', name: 'NBC', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=NBC&code=us&user=cdnlivetv&plan=free' },
  { id: 'fox', name: 'FOX', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=FOX&code=us&user=cdnlivetv&plan=free' },
  { id: 'telemundo', name: 'Telemundo', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Telemundo&code=us&user=cdnlivetv&plan=free' },

  // --- News ---
  { id: 'cnn', name: 'CNN', type: 'iframe', category: 'News', url: 'https://cdn-live.tv/api/v1/channels/player/?name=CNN&code=us&user=cdnlivetv&plan=free' },
  { id: 'fox-news', name: 'FOX News', type: 'iframe', category: 'News', url: 'https://cdn-live.tv/api/v1/channels/player/?name=FOX%20News&code=us&user=cdnlivetv&plan=free' },
  { id: 'bloomberg', name: 'Bloomberg TV', type: 'hls', category: 'News', url: 'https://d35j504z0x2vu2.cloudfront.net/v1/master/0bc8e8376bd8417a1b6761138aa41c26c7309312/bloomberg-television/bloombergtv.m3u8' },
  { id: 'vice-news', name: 'Vice News', type: 'hls', category: 'News', url: 'https://vicetv-vicefast2-firetv.amagi.tv/playlist.m3u8' },
  { id: 'france24', name: 'France 24 English', type: 'hls', category: 'News', url: 'https://amg00106-france24-france24-samsunguk-qvpp8.amagi.tv/playlist/amg00106-france24-france24-samsunguk/playlist.m3u8' },
  { id: 'yahoo-finance', name: 'Yahoo! Finance', type: 'hls', category: 'News', url: 'https://d1ewctnvcwvvvu.cloudfront.net/playlist.m3u8' },
  { id: 'talktv', name: 'TalkTV', type: 'hls', category: 'News', url: 'https://live-talktv-ssai.simplestreamcdn.com/v1/master/774d979dd66704abea7c5b62cb34c6815fda0d35/talktv-live/index.m3u8' },
  { id: 'black-news-channel', name: 'Black News Channel', type: 'hls', category: 'News', url: 'https://blacknewschannel-xumo-us.amagi.tv/playlist.m3u8' },


  // --- Entertainment & Movies ---
  { id: 'hbo', name: 'HBO', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=HBO&code=us&user=cdnlivetv&plan=free' },
  { id: 'showtime', name: 'Showtime', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Showtime&code=us&user=cdnlivetv&plan=free' },
  { id: 'cinemax', name: 'Cinemax', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Cinemax&code=us&user=cdnlivetv&plan=free' },
  { id: 'bet', name: 'BET', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=BET&code=us&user=cdnlivetv&plan=free' },
  { id: 'tbs', name: 'TBS', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TBS&code=us&user=cdnlivetv&plan=free' },
  { id: 'tlc', name: 'TLC', type: 'iframe', category: 'Lifestyle', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TLC&code=us&user=cdnlivetv&plan=free' },
  { id: 'history', name: 'History', type: 'iframe', category: 'Lifestyle', url: 'https://cdn-live.tv/api/v1/channels/player/?name=History&code=us&user=cdnlivetv&plan=free' },
  { id: 'discovery', name: 'Discovery Channel', type: 'iframe', category: 'Lifestyle', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Discovery%20Channel&code=us&user=cdnlivetv&plan=free' },
  { id: 'nat-geo', name: 'National Geographic', type: 'iframe', category: 'Lifestyle', url: 'https://cdn-live.tv/api/v1/channels/player/?name=National%20Geographic&code=us&user=cdnlivetv&plan=free' },
  { id: 'bbc-earth', name: 'BBC Earth', type: 'hls', category: 'Lifestyle', url: 'https://amg00793-amg00793c6-xumo-us-2669.playouts.now.amagi.tv/BBCStudios-BBCEarthA-hls/playlist.m3u8' },
  { id: 'baywatch', name: 'Baywatch', type: 'hls', category: 'Entertainment', url: 'https://amg00145-fremantlemedian-baywatch-samsungau-gtsd6.amagi.tv/playlist/amg00145-fremantlemedian-baywatch-samsungau/playlist.m3u8' },
  { id: 'top-gear', name: 'Top Gear', type: 'hls', category: 'Entertainment', url: 'https://d1daq1khzqxpku.cloudfront.net/playlist.m3u8' },
  { id: 'documentary-plus', name: 'Documentary+', type: 'hls', category: 'Entertainment', url: 'https://ef79b15c8c7c46c7a9de9d33001dbd07.mediatailor.us-west-2.amazonaws.com/v1/master/ba62fe743df0fe93366eba3a257d792884136c7f/LINEAR-859-DOCUMENTARYPLUS-DOCUMENTARYPLUS/mt/documentaryplus/859/hls/master/playlist.m3u8' },
  { id: 'afroland-tv', name: 'AfroLandTV', type: 'hls', category: 'Entertainment', url: 'https://alt-al.otteravision.com/alt/al/al.m3u8' },
  { id: 'nolly-africa', name: 'Nolly Africa HD', type: 'hls', category: 'Entertainment', url: 'https://amg02784-amg02784c1-distrotv-us-3394.playouts.now.amagi.tv/playlist/amg02784-nollyafricafast-nollyafricahd-distrotvus/playlist.m3u8' },
  { id: 'ted', name: 'TED', type: 'hls', category: 'Lifestyle', url: 'https://d1b16tvvxk3tnu.cloudfront.net/TED.m3u8' },
  { id: 'just-for-laughs', name: 'Just For Laughs Gags', type: 'hls', category: 'Entertainment', url: 'https://distributionsjustepourrire-justforlaughsgags-1-be.samsung.wurl.tv/playlist.m3u8' },
  { id: 'today-all-day', name: 'TODAY All Day', type: 'hls', category: 'News', url: 'https://d37kx062o4ii0p.cloudfront.net/master.m3u8' },
  { id: 'et-online', name: 'Entertainment Tonight', type: 'hls', category: 'Entertainment', url: 'https://enterbcef94b.airspace-cdn.cbsivideo.com/master.m3u8' },
  { id: 'dr-phil', name: 'Dr Phil MeritTV', type: 'hls', category: 'Entertainment', url: 'https://d9069ugodwkju.cloudfront.net/Merit_Street.m3u8' },
  { id: 'dry-bar-comedy', name: 'Dry Bar Comedy', type: 'hls', category: 'Entertainment', url: 'https://drybar-drybarcomedy-1-au.samsung.wurl.tv/playlist.m3u8' },


  // --- Kids ---
  { id: 'disney-channel', name: 'Disney Channel', type: 'iframe', category: 'Kids', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Disney%20Channel&code=us&user=cdnlivetv&plan=free' },
  { id: 'nickelodeon', name: 'Nickelodeon TV', type: 'iframe', category: 'Kids', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Nickelodeon%20TV&code=us&user=cdnlivetv&plan=free' },
  { id: 'bbc-kids', name: 'BBC Kids', type: 'hls', category: 'Kids', url: 'https://dmr1h4skdal9h.cloudfront.net/playlist.m3u8' },
  { id: 'lego-channel', name: 'Lego Channel', type: 'hls', category: 'Kids', url: 'https://jmp2.uk/stvp-GBBC4300005AL' },
  { id: 'toon-goggles', name: 'ToonGoggles', type: 'hls', category: 'Kids', url: 'https://amg01329-otterainc-toongoggles-samsungau-ad-4c.amagi.tv/playlist/amg01329-otterainc-toongoggles-samsungau/playlist.m3u8' },
  { id: 'ninja-kidz', name: 'Ninja Kidz', type: 'hls', category: 'Kids', url: 'https://d3868b4ny0rgdf.cloudfront.net/playlist.m3u8' },


  // --- Music ---
  { id: 'afrobeats-itv', name: 'iTV Afrobeats Music', type: 'hls', category: 'Music', url: 'https://ca1.buximedia.com/itv/afrobeats/tracks-v1a1/mono.m3u8' },
  { id: 'afrobeats-global', name: 'Afrobeats Global', type: 'hls', category: 'Music', url: 'https://stream.ecable.tv/afrobeats/index.m3u8' },
  { id: 'new-kpop', name: 'NEW K-POP', type: 'hls', category: 'Music', url: 'https://newidco-newkid-1-eu.xiaomi.wurl.tv/playlist.m3u8' },

  // --- Sports (TV Hub Version) ---
  { id: 'cbs-golazo', name: 'CBS Sports Golazo', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=CBS%20Sports%20Golazo&code=us&user=cdnlivetv&plan=free' },
  { id: 'fifa-plus', name: 'FIFA+', type: 'hls', category: 'Sports', url: 'https://a62dad94.wurl.com/master/f36d25e7e52f1Ht6TLmpMc3xhN5euPZo5ecC4RJtfJrJu8/UmFrdXRlblRWLWV1X0ZJRkFQbHVzRW5nbGlzaF9ITFM/playlist.m3u8' },
  { id: 'supersport-action', name: 'SuperSport Action', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=SuperSport%20Action&code=za&user=cdnlivetv&plan=free' },
  { id: 'supersport-pl', name: 'SuperSport Premier League', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=SuperSport%20Premier%20League&code=za&user=cdnlivetv&plan=free' },
  { id: 'sky-sports-tennis', name: 'Sky Sports Tennis', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free' },
  { id: 'sky-sports-main', name: 'Sky Sports Main Event', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Main%20Event&code=gb&user=cdnlivetv&plan=free' },
  { id: 'tnt-sports-1', name: 'TNT Sports 1', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports%201&code=gb&user=cdnlivetv&plan=free' },
  { id: 'nbc-sports-now', name: 'NBC Sports NOW', type: 'hls', category: 'Sports', url: 'https://d4whmvwm0rdvi.cloudfront.net/10007/99993008/hls/master.m3u8' },
  { id: 'cbs-sports-network', name: 'CBS Sports Network', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=CBS%20Sports%20Network&code=us&user=cdnlivetv&plan=free' },
  { id: 'espn-news', name: 'ESPN News', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN%20News&code=us&user=cdnlivetv&plan=free' },
  { id: 'dazn-laliga', name: 'DAZN LaLiga', type: 'iframe', category: 'Sports', url: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%20LaLiga&code=es&user=cdnlivetv&plan=free' },

  // --- Batch 3: Universal Expansion ---
  { id: 'talksport', name: 'talkSPORT', type: 'hls', category: 'Sports', url: 'https://af7a8b4e.wurl.com/master/f36d25e7e52f1Ht6TLmpMc3xhN5euPZo5ecC4RJtfJrJu8/TEctZ2JfdGFsa1NQT1JUX0hMUw/playlist.m3u8' },
  { id: 'pluto-horror', name: 'Pluto TV Horror', type: 'hls', category: 'Entertainment', url: 'https://jmp2.uk/plu-569546031a619b8f07ce6e25.m3u8' },
  { id: 'afhv', name: 'America\'s Funniest Home Videos', type: 'hls', category: 'Entertainment', url: 'https://d1mp1kdk5zi1ie.cloudfront.net/playlist.m3u8' },
  { id: 'crime360', name: 'Crime360', type: 'hls', category: 'Entertainment', url: 'https://eb3933ec.wurl.com/master/f36d25e7e52f1Ht6TLmpMc3xhN5euPZo5ecC4RJtfJrJu8/Um9rdV9DcmltZTM2MF9ITFM/playlist.m3u8' },
  { id: 'gravitas-movies', name: 'Gravitas Movies', type: 'hls', category: 'Entertainment', url: 'https://d6dg3ebeih71x.cloudfront.net/Gravitas_Movies.m3u8' },
  { id: 'maverick-black-cinema', name: 'Maverick Black Cinema', type: 'hls', category: 'Entertainment', url: 'https://maverick-maverick-black-cinema-3-us.roku.wurl.tv/playlist.m3u8' },
  { id: 'circle-tv', name: 'Circle', type: 'hls', category: 'Lifestyle', url: 'https://circle-roku.amagi.tv/playlist.m3u8' },
  { id: 'womens-sports-network', name: 'Women\'s Sports Network', type: 'hls', category: 'Sports', url: 'https://d39accvx65hq9o.cloudfront.net/Womens_Sports_Network.m3u8' },
  { id: 'universal-kids', name: 'Universal Kids', type: 'iframe', category: 'Kids', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Universal%20Kids&code=us&user=cdnlivetv&plan=free' },
  { id: 'baby-shark-tv', name: 'Baby Shark TV', type: 'hls', category: 'Kids', url: 'https://newidco-babysharktv-1-us.roku.wurl.tv/playlist.m3u8' },
  { id: '3abn-kids', name: '3ABN Kids Network', type: 'hls', category: 'Kids', url: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8' },
  { id: 'xite-rock-metal', name: 'XITE Rock x Metal', type: 'hls', category: 'Music', url: 'https://d198ro05q94rc4.cloudfront.net/XITE_Rock_On.m3u8' },
  { id: 'xite-just-chill', name: 'XITE Just Chill', type: 'hls', category: 'Music', url: 'https://dvnftgdlbnemm.cloudfront.net/XITE_Just_Chill.m3u8' },
  { id: 'cops-tv', name: 'Cops', type: 'hls', category: 'Entertainment', url: 'https://langleyproductions-cops-2-eu.rakuten.wurl.tv/playlist.m3u8' },
  { id: 'univision', name: 'Univision', type: 'iframe', category: 'Entertainment', url: 'https://cdn-live.tv/api/v1/channels/player/?name=Univision&code=us&user=cdnlivetv&plan=free' },
  { id: 'accuweather-now', name: 'AccuWeather Now', type: 'hls', category: 'News', url: 'https://cdn-ue1-prod.tsv2.amagi.tv/linear/amg00684-accuweather-accuweather-plex/playlist.m3u8' },
  { id: 'fear-factor', name: 'Fear Factor', type: 'hls', category: 'Entertainment', url: 'https://amg00627-banijaygroup-fearfactor-samsungau-9vdod.amagi.tv/playlist/amg00627-banijaygroup-fearfactor-samsungau/playlist.m3u8' },
  { id: 'bbc-food', name: 'BBC Food', type: 'hls', category: 'Lifestyle', url: 'https://d1e354daam8g5r.cloudfront.net/playlist.m3u8' },
  { id: 'cold-case-files', name: 'Cold Case Files', type: 'hls', category: 'Entertainment', url: 'https://aegis-cloudfront-1.tubi.video/1e764712-0649-4946-bd7e-f1bbba3be6fa/playlist.m3u8' },
  { id: 'filmrise-anime', name: 'FilmRise Anime', type: 'hls', category: 'Kids', url: 'https://dvu7aia8rjlfm.cloudfront.net/master.m3u8' },
  { id: '90s-throwback', name: '90s Throwback', type: 'hls', category: 'Music', url: 'https://jmp2.uk/plu-5f4d86f519358a00072b978e.m3u8' },
  { id: 'mr-bean-animated', name: 'Mr. Bean Animated', type: 'hls', category: 'Kids', url: 'https://amg00627-amg00627c23-samsung-au-4110.playouts.now.amagi.tv/playlist.m3u8' },
  { id: 'game-show-central', name: 'Game Show Central', type: 'hls', category: 'Entertainment', url: 'https://aegis-cloudfront-1.tubi.video/55c4e96c-e345-486c-8f61-8320b61d734d/playlist.m3u8' },
  { id: 'comet-tv', name: 'Comet', type: 'hls', category: 'Entertainment', url: 'https://fast-channels.sinclairstoryline.com/COMET/index.m3u8' },
  { id: 'love-nature', name: 'Love Nature', type: 'hls', category: 'Lifestyle', url: 'https://aegis-cloudfront-1.tubi.video/6d6d0f24-8445-4b4c-bdf6-44f9e38beaa4/playlist.m3u8' },
  { id: 'vevo-hip-hop', name: 'Vevo Hip Hop', type: 'hls', category: 'Music', url: 'https://d3vgs3ro3x6v8a.cloudfront.net/Vevo_Hip_Hop.m3u8' },
  { id: 'vevo-pop', name: 'Vevo Pop', type: 'hls', category: 'Music', url: 'https://d128y56w6v2kax.cloudfront.net/playlist/amg00056-vevotv-vevopopau-samsungau/playlist.m3u8' },
  { id: 'mutv', name: 'MUTV', type: 'hls', category: 'Sports', url: 'https://bcovlive-a.akamaihd.net/r2d2c4ca5bf57456fb1d16255c1a535c8/eu-west-1/6058004203001/playlist.m3u8' },

  // --- External Script-Based (Ajax/Iframe) ---
  { id: 'star-plus', name: 'Star Plus', type: 'iframe', category: 'Entertainment', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=41&sid=0&fid=tv' },
  { id: 'animal-planet-global', name: 'Animal Planet', type: 'iframe', category: 'Lifestyle', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=27&sid=0&fid=tv' },
  { id: 'shara-filmy', name: 'Shara Filmy', type: 'iframe', category: 'Entertainment', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=8&sid=0&fid=tv' },
  { id: 'sky-sport-global', name: 'Sky Sport', type: 'iframe', category: 'Sports', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=28&sid=0&fid=tv' },
  { id: 'samaa-news', name: 'Samaa News', type: 'iframe', category: 'News', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=51&sid=0&fid=tv' },
  { id: 'densy-up', name: 'Densy Up', type: 'iframe', category: 'Lifestyle', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=55&sid=0&fid=tv' },
  { id: 'line-sport', name: 'Line Sport', type: 'iframe', category: 'Sports', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=43&sid=0&fid=tv' },
  { id: 'utv-movies', name: 'UTV Movies', type: 'iframe', category: 'Entertainment', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=14&sid=0&fid=tv' },
  { id: 'zoom-tv', name: 'Zoom TV', type: 'iframe', category: 'Entertainment', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=22&sid=0&fid=tv' },
  { id: 'color-tv', name: 'Color TV', type: 'iframe', category: 'Entertainment', url: 'http://streaming.tvembed.eu/ajax.php?cid=0&p=view_channel&id=23&sid=0&fid=tv' },


];
