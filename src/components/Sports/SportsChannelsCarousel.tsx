import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';

const PREMIUM_NETWORKS = [
  { id: 'wwe', name: 'WWE Network', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/WWE_Logo.svg/1200px-WWE_Logo.svg.png', bg: 'bg-red-900/40' },
  { id: 'nfl', name: 'NFL Network', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/National_Football_League_logo.svg/1200px-National_Football_League_logo.svg.png', bg: 'bg-blue-900/40' },
  { id: 'nba', name: 'NBA TV', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/03/National_Basketball_Association_logo.svg/315px-National_Basketball_Association_logo.svg.png', bg: 'bg-indigo-900/40' },
  { id: 'espn', name: 'ESPN', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/1200px-ESPN_wordmark.svg.png', bg: 'bg-red-800/40' },
  { id: 'skysports-epl', name: 'Sky Sports EPL', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/02/Sky_Sports_Premier_League_logo.svg/1200px-Sky_Sports_Premier_League_logo.svg.png', bg: 'bg-blue-800/40' },
  { id: 'skysports-f1', name: 'Sky Sports F1', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Sky_Sports_F1_logo_2020.svg/2560px-Sky_Sports_F1_logo_2020.svg.png', bg: 'bg-slate-800/40' },
  { id: 'mlb', name: 'MLB Network', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a6/Major_League_Baseball_logo.svg/1200px-Major_League_Baseball_logo.svg.png', bg: 'bg-red-800/40' },
  { id: 'ufc', name: 'UFC Central', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/UFC_logo.svg/2560px-UFC_logo.svg.png', bg: 'bg-red-900/40' }
];

const SportsChannelsCarousel: React.FC = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleChannelClick = (channelId: string) => {
    navigate(`/sports/channel-${channelId}/watch`);
  };

  return (
    <div className="w-full mt-4 mb-10 px-0">
      <div className="flex items-center justify-between mb-4 px-2">
         <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
             <span className="w-1.5 h-6 bg-primary rounded-full md:block hidden"></span>
             Explore Premium Channels
         </h2>
      </div>
      
      <div className="relative group">
        <div 
           ref={scrollContainerRef}
           className="flex gap-4 overflow-x-auto custom-scrollbar pb-6 px-2 snap-x snap-mandatory scroll-smooth"
        >
           {PREMIUM_NETWORKS.map((network, index) => (
              <motion.div
                key={network.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleChannelClick(network.id)}
                className="shrink-0 cursor-pointer snap-center group/card"
              >
                  <div className={`w-[140px] h-[200px] md:w-[180px] md:h-[260px] rounded-2xl ${network.bg} border border-white/10 backdrop-blur-sm overflow-hidden relative flex flex-col items-center justify-center transition-all duration-300 group-hover/card:scale-105 group-hover/card:border-primary/50 group-hover/card:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]`}>
                      {/* Glossy Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                      
                      <div className="z-20 p-4 transform transition-transform duration-300 group-hover/card:scale-110">
                         <LazyLoadImage 
                            src={network.logo} 
                            alt={network.name}
                            className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl opacity-90 group-hover/card:opacity-100 filter contrast-125"
                            effect="blur"
                         />
                      </div>
                      
                      <div className="absolute bottom-4 left-0 right-0 text-center z-20 px-2">
                         <p className="text-white font-black uppercase tracking-widest text-[10px] md:text-xs">
                           LIVE 24/7
                         </p>
                         <p className="text-gray-300 text-[10px] md:text-xs font-medium mt-1 group-hover/card:text-white transition-colors">
                           {network.name}
                         </p>
                      </div>
                      
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/50">
                             <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                             </svg>
                          </div>
                      </div>
                  </div>
              </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default SportsChannelsCarousel;
