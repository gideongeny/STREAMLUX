import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper';

import { SPORTS_TV_CHANNELS, channelGradient, channelLogoUrl } from '../../utils/sportLiveTVChannels';
import type { TVChannel } from '../../utils/tvChannelMap';

const SportsChannelsCarousel: React.FC = () => {
  const navigate = useNavigate();
  const channels = React.useMemo(() => SPORTS_TV_CHANNELS.slice(0, 28), []);

  const handleChannelClick = (channel: TVChannel) => {
    navigate(`/live-tv/${channel.id}`, {
      state: {
        streamUrl: channel.url,
        channelName: channel.name,
        streamType: channel.type,
      },
    });
  };

  return (
    <div className="w-full mt-2 mb-6">
      <motion.div className="flex items-center gap-3 mb-5 px-1">
        <span className="w-1 h-6 bg-primary rounded-full hidden md:block shrink-0" />
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">
          Explore Channels
        </h2>
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
          LIVE 24/7
        </span>
      </motion.div>

      <div className="relative tw-section-slider">
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          slidesPerView="auto"
          slidesPerGroupAuto
          spaceBetween={15}
          className="!py-4 px-1"
        >
          {channels.map((channel, index) => {
            const logo = channelLogoUrl(channel.logo);
            const bg = channelGradient(channel.name);
            return (
              <SwiperSlide key={channel.id} className="!w-[135px] md:!w-[160px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleChannelClick(channel)}
                  className="shrink-0 cursor-pointer group h-full"
                >
                  <div
                    className={`w-full h-[185px] md:h-[220px] rounded-2xl bg-gradient-to-b ${bg} border border-white/8 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-primary/40 group-hover:shadow-[0_0_24px_rgba(229,62,62,0.25)]`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-white/5 z-10 pointer-events-none" />

                    <div
                      className="z-20 px-4 flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ height: '55%' }}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={channel.name}
                          className="max-w-full max-h-full object-contain drop-shadow-2xl opacity-90 group-hover:opacity-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-3xl">📺</span>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 pb-3 pt-8 bg-gradient-to-t from-black/90 to-transparent z-20 flex flex-col items-center px-2">
                      <p className="text-[8px] text-primary font-black uppercase tracking-[0.2em]">
                        {channel.category}
                      </p>
                      <p className="text-white text-[10px] md:text-[11px] font-bold text-center leading-tight mt-0.5">
                        {channel.name}
                      </p>
                    </div>

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
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default SportsChannelsCarousel;
