import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';

// Each channel: id used in URL, display name, local logo, iframe src, stream type
const PREMIUM_NETWORKS = [
  {
    id: 'nba', name: 'NBA TV', label: 'Basketball',
    logo: '/images/logos/134-1349206_nba-logo-png-transparent-background-nba-logo-transparent-background.png',
    bg: 'from-blue-950 to-indigo-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=NBA%20TV&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'wwe', name: 'WWE Network', label: 'Wrestling',
    logo: '/images/leagues/wwe-logo.jpg',
    bg: 'from-red-950 to-red-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=WWE&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'epl', name: 'Premier League', label: 'Football',
    logo: '/images/logos/Premier_League-Logo.png',
    bg: 'from-purple-950 to-violet-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Premier%20League&code=gb&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'ucl', name: 'Champions League', label: 'Football',
    logo: '/images/logos/UEFA_Champions_League-Logo.png',
    bg: 'from-slate-900 to-blue-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=es&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'laliga', name: 'LaLiga', label: 'Football',
    logo: '/images/logos/LaLiga-Logo.png',
    bg: 'from-orange-950 to-red-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=LaLiga%20TV&code=gb&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'bundesliga', name: 'Bundesliga', label: 'Football',
    logo: '/images/logos/35-358081_from-wikipedia-the-free-encyclopedia-bundesliga-logo-png.png',
    bg: 'from-red-950 to-zinc-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=de&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'seriea', name: 'Serie A', label: 'Football',
    logo: '/images/logos/Italian-Serie-A-Logo-2019.png',
    bg: 'from-blue-950 to-sky-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=DAZN%201&code=it&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'ligue1', name: 'Ligue 1', label: 'Football',
    logo: '/images/logos/Ligue-1-Logo.png',
    bg: 'from-cyan-950 to-blue-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%202&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'ufc', name: 'UFC', label: 'MMA',
    logo: '/images/leagues/Ultimate-Fighting-Championship-2015.png',
    bg: 'from-red-950 to-black',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=ESPN&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'nfl', name: 'NFL', label: 'American Football',
    logo: '/images/logos/NFL-Logo-1-1155x770.png',
    bg: 'from-blue-950 to-red-950',
    iframeSrc: '',
    hlsSrc: 'https://pb-we3ltka9xobj6.akamaized.net/master.m3u8',
    type: 'hls'
  },
  {
    id: 'mlb', name: 'MLB Network', label: 'Baseball',
    logo: '/images/logos/115-1157400_nfl-mlb-nhl-ncaa-major-league-baseball-logo.png',
    bg: 'from-red-950 to-blue-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=MLB%20Network&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'nhl', name: 'NHL Network', label: 'Ice Hockey',
    logo: '/images/logos/NHL-Symbol.png',
    bg: 'from-slate-900 to-black',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=NHL%20Network&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'f1', name: 'Formula 1', label: 'Motorsport',
    logo: '/images/logos/Moto_Gp_logo.svg.png',
    bg: 'from-red-950 to-zinc-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20F1&code=gb&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'motogp', name: 'MotoGP', label: 'Motorsport',
    logo: '/images/logos/Moto_Gp_logo.svg.png',
    bg: 'from-red-900 to-orange-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=FOX%20Sports&code=mx&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'wimbledon', name: 'Tennis / Sky Sports', label: 'Tennis',
    logo: '/images/logos/Althletics logo.png',
    bg: 'from-green-950 to-emerald-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Main%20Event&code=gb&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'libertadores', name: 'Libertadores', label: 'Football',
    logo: '/images/logos/Conmebol_Libertadores_logo.svg.png',
    bg: 'from-yellow-950 to-amber-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=TNT%20Sports&code=ar&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'rugby', name: 'Rugby', label: 'Rugby',
    logo: '/images/logos/Rugby-World-Cup.jpg',
    bg: 'from-green-950 to-lime-900',
    iframeSrc: '',
    hlsSrc: 'https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8',
    type: 'hls'
  },
  {
    id: 'afcon', name: 'AFCON / CAF', label: 'Football',
    logo: '/images/logos/Confédération-Africaine-de-Football-logo.png',
    bg: 'from-green-950 to-yellow-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=beIN%20SPORTS%201&code=sa&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'ao', name: 'Australian Open', label: 'Tennis',
    logo: '/images/logos/Logo-Australian-Open.png',
    bg: 'from-blue-950 to-cyan-900',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=Stan%20Sport%202&code=au&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'masters', name: 'The Masters', label: 'Golf',
    logo: '/images/logos/Masters-Logo.jpg',
    bg: 'from-green-950 to-emerald-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=GOLF%20TV&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'icc', name: 'ICC Cricket', label: 'Cricket',
    logo: '/images/logos/670-6705593_icc-logo-svg-international-cricket-council-hd-png.png',
    bg: 'from-blue-950 to-sky-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=Sky%20Sports%20Tennis&code=gb&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'tdf', name: 'Tour de France', label: 'Cycling',
    logo: '/images/logos/TDF_(Unternehmen)_logo.svg.png',
    bg: 'from-yellow-950 to-red-950',
    iframeSrc: 'https://cdn-live.tv/api/v1/channels/player/?name=USA%20Network&code=us&user=cdnlivetv&plan=free',
    type: 'iframe'
  },
  {
    id: 'sixnations', name: 'Six Nations', label: 'Rugby',
    logo: '/images/logos/Six nations.jpg',
    bg: 'from-blue-950 to-white/10',
    iframeSrc: '',
    hlsSrc: 'https://dt1kh32hg3tft.cloudfront.net/v1/world_rugby_rugbypasstv_1/samsungheadend_us/latest/main/hls/playlist.m3u8',
    type: 'hls'
  },
  {
    id: 'pga', name: 'PGA Tour', label: 'Golf',
    logo: '/images/logos/Masters-Logo.jpg',
    bg: 'from-green-950 to-teal-950',
    iframeSrc: '',
    hlsSrc: 'https://pb-783hpus5r91wv.akamaized.net/playlist.m3u8',
    type: 'hls'
  },
  {
    id: 'bellator', name: 'Bellator MMA', label: 'MMA',
    logo: '/images/leagues/Ultimate-Fighting-Championship-2015.png',
    bg: 'from-red-950 to-zinc-950',
    iframeSrc: '',
    hlsSrc: 'https://jmp2.uk/plu-5ebc8688f3697d00072f7cf8.m3u8',
    type: 'hls'
  },
];

const SportsChannelsCarousel: React.FC = () => {
  const navigate = useNavigate();

  const handleChannelClick = (channel: typeof PREMIUM_NETWORKS[0]) => {
    navigate(`/sports/${channel.id}/channel-${channel.id}/watch`, {
      state: {
        streamUrl: channel.type === 'iframe' ? channel.iframeSrc : channel.hlsSrc,
        channelName: channel.name,
        streamType: channel.type
      }
    });
  };

  return (
    <div className="w-full mt-2 mb-6">
      <div className="flex items-center gap-3 mb-5 px-1">
        <span className="w-1 h-6 bg-primary rounded-full hidden md:block shrink-0" />
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">
          Explore Channels
        </h2>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          LIVE 24/7
        </span>
      </div>
      
      <div className="relative tw-section-slider">
        <Swiper
          modules={[Navigation]}
          navigation
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={15}
          className="!py-4 px-1"
        >
          {PREMIUM_NETWORKS.map((network, index) => (
            <SwiperSlide key={network.id} className="!w-[135px] md:!w-[160px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => handleChannelClick(network)}
                className="shrink-0 cursor-pointer group h-full"
              >
                <div className={`w-full h-[185px] md:h-[220px] rounded-2xl bg-gradient-to-b ${network.bg} border border-white/8 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40 group-hover:shadow-[0_0_24px_rgba(229,62,62,0.25)]`}>
                  
                  {/* Gradient shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 z-10 pointer-events-none" />
                  
                  {/* Logo */}
                  <div className="z-20 px-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" style={{ height: '55%' }}>
                    <img 
                      src={network.logo} 
                      alt={network.name}
                      className="max-w-full max-h-full object-contain drop-shadow-2xl opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 pb-3 pt-8 bg-gradient-to-t from-black/90 to-transparent z-20 flex flex-col items-center px-2">
                    <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em]">{network.label}</p>
                    <p className="text-white text-[10px] md:text-[11px] font-bold text-center leading-tight mt-0.5">{network.name}</p>
                  </div>

                  {/* Play button overlay on hover */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
                      <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default SportsChannelsCarousel;
