import React, { useState, useMemo, FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import { useInView } from 'react-intersection-observer';
import { TVChannel, KENYA_TV_CHANNELS } from '../../utils/tvChannelMap';
import { useLiveChannels } from '../../hooks/useLiveChannels';
import { channelIngestor, IngestionStatus } from '../../utils/channelIngestor';
import { FiTv, FiSearch, FiZap, FiRadio, FiGlobe, FiFilm, FiActivity, FiMapPin, FiFilter, FiBookOpen, FiCpu, FiHeart, FiVideo, FiMap, FiSmile, FiBox, FiArrowLeft, FiLoader, FiUploadCloud } from 'react-icons/fi';

const CATEGORY_ICONS: Record<string, any> = {
  All: FiTv,
  News: FiGlobe,
  Entertainment: FiFilm,
  Sports: FiActivity,
  Kids: FiZap,
  Music: FiRadio,
  Lifestyle: FiSmile,
  Movies: FiFilm,
  Documentary: FiBox,
  Science: FiCpu,
  Religious: FiHeart,
  Education: FiBookOpen,
  Shopping: FiVideo,
  Travel: FiMap
};

const CATEGORY_LIST = ['All', 'Movies', 'Sports', 'News', 'Documentary', 'Entertainment', 'Kids', 'Music', 'Lifestyle', 'Science', 'Religious', 'Education', 'Shopping', 'Travel'];

const resolveLogo = (logo: string | undefined): string => {
  if (!logo) return '';
  if (logo.startsWith('http')) return logo;
  // Some shorthand logos are in public/images/logos/
  // Map common ones or assume they are .png/.jpg
  const commonExtensions: Record<string, string> = {
    'bbc': '.png',
    'nbc': '.png',
    'cnn_logo_3': '.png',
    'hbo': '.png',
    'showtime': '.png',
    'cinemax': '.png',
    'tbs': '.png',
    'fox': '.png',
    'abc': '.png',
    'espn': '.png'
  };
  const ext = commonExtensions[logo.toLowerCase()] || '.png';
  return `/images/logos/${logo}${ext}`;
};

interface LiveTVCardProps {
  channel: TVChannel;
  onClick: (channel: TVChannel) => void;
}

const LiveTVCard: FC<LiveTVCardProps> = React.memo(({ channel, onClick }) => {
  const [logoError, setLogoError] = useState(false);
  const logoUrl = resolveLogo(channel.logo);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(channel)}
      className="group relative h-48 rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-primary/30 cursor-pointer shadow-2xl transition-all w-full"
    >
      {(channel.logo || channel.name) && (
        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-20 group-hover:opacity-10 transition-opacity">
          {!logoError && logoUrl ? (
            <img 
              src={logoUrl} 
              alt={channel.name} 
              onError={() => setLogoError(true)}
              className="max-w-full max-h-full object-contain grayscale brightness-200"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
               <FiTv className="w-12 h-12 text-white/40" />
               <span className="text-[20px] font-black text-white/20 uppercase tracking-tighter italic">
                 {channel.name.charAt(0)}
               </span>
            </div>
          )}
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 rounded text-[7px] font-black uppercase tracking-widest text-primary">
            {channel.category}
          </span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-black tracking-tight uppercase line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {channel.name}
          </h3>
          <span className="text-[8px] font-bold text-gray-500 uppercase">
              {channel.country || 'Global'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

interface LiveTVSectionProps {
  title: string;
  category: string;
  channels: TVChannel[];
  onChannelClick: (c: TVChannel) => void;
  onSeeMore: (category: string) => void;
}

const LiveTVSection: FC<LiveTVSectionProps> = React.memo(({ title, category, channels, onChannelClick, onSeeMore }) => {
  if (channels.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <span className="w-1 h-6 bg-primary rounded-full hidden md:block shrink-0" />
          <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-widest">
            {title}
          </h2>
          <span className="text-[8px] font-bold text-primary/60 uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
            {channels.length} Channels
          </span>
        </div>

        <button 
          onClick={() => onSeeMore(category)}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group"
        >
          Explore All
          <motion.span
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            →
          </motion.span>
        </button>
      </div>
      
      <Swiper
        modules={[Navigation]}
        navigation
        slidesPerView="auto"
        slidesPerGroupAuto
        spaceBetween={20}
        className="!py-4"
      >
        {channels.slice(0, 20).map((channel) => (
          <SwiperSlide key={channel.id} className="!w-[160px] md:!w-[220px]">
            <LiveTVCard channel={channel} onClick={onChannelClick} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

interface LiveTVHubProps {
  isEmbed?: boolean;
  searchQuery?: string;
}

const LiveTVHub: React.FC<LiveTVHubProps> = ({ isEmbed, searchQuery: propSearchQuery }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeCountry, setActiveCountry] = useState<string>('All');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(localSearchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchQuery]);

  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : debouncedSearchQuery;
  const setSearchQuery = propSearchQuery !== undefined ? () => {} : setLocalSearchQuery;

  // Dynamic Data Fetching
  const filters = useMemo(() => ({ 
    category: activeCategory, 
    country: activeCountry, 
    searchQuery 
  }), [activeCategory, activeCountry, searchQuery]);

  const { 
    channels, 
    loading, 
    isRefreshing,
    loadingMore, 
    hasMore, 
    isInstant,
    loadMore 
  } = useLiveChannels(filters);

  // Memoized Categorization to prevent UI Thread Jitter on Mobile
  const categorizedChannels = useMemo(() => {
    if (activeCategory !== 'All' || searchQuery) return { 'Results': channels };
    
    const map: Record<string, TVChannel[]> = {};
    const channelsByCategory = channels.reduce((acc, channel) => {
      if (!acc[channel.category]) acc[channel.category] = [];
      acc[channel.category].push(channel);
      return acc;
    }, {} as Record<string, TVChannel[]>);

    CATEGORY_LIST.filter(c => c !== 'All').forEach(cat => {
      const found = channelsByCategory[cat] || [];
      if (found.length > 0) map[cat] = found;
    });
    return map;
  }, [channels, activeCategory, searchQuery]);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadingMore, loadMore]);

  const handleChannelClick = (channel: TVChannel) => {
    navigate(`/live-tv/${channel.id}`, { state: { channel } });
  };

  const handleStartIngestion = async () => {
    if (!window.confirm("Start ingesting 100k+ channels from iptv-org? This will populate your Firestore database.")) return;
    try {
      await channelIngestor.ingestFromIptvOrg(setIngestionStatus);
    } catch (err: any) {
      alert(err.message || "Ingestion failed. See console.");
    }
  };

  return (
    <div className={`${isEmbed ? '' : 'min-h-screen pt-24'} bg-[#050505] text-white pb-20 px-4 md:px-10`}>
      {!isEmbed && (
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Live Broadcasting • Dynamic Cloud Registry
                </motion.div>
                
                {/* Admin Ingestion Trigger */}
                <button 
                  onClick={handleStartIngestion}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 hover:text-primary transition-all opacity-20 hover:opacity-100"
                  title="Admin: Sync 100k Channels"
                >
                  <FiUploadCloud className="w-3 h-3" />
                </button>

                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full"
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-orange-500 animate-pulse' : 'bg-green-500'} `} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">
                    {isRefreshing ? 'Syncing Registry...' : isInstant ? 'Cloud Engine Active' : 'Local Engine Ready'}
                  </span>
                </motion.div>
              </div>

              {ingestionStatus && !ingestionStatus.isFinished && (
                <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-4">
                  <FiLoader className="w-5 h-5 text-primary animate-spin" />
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Scaling Database: {ingestionStatus.processed} / {ingestionStatus.totalFound} channels synced...
                  </div>
                </div>
              )}

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-4"
              >
                <button 
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <FiTv className="w-4 h-4" />
                  Dashboard
                </button>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase"
              >
                Live <span className="text-white/20">Hub</span>
              </motion.h1>
            </div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.2 }}
               className="relative w-full md:w-96"
            >
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search 100,000+ channels..."
                value={propSearchQuery !== undefined ? propSearchQuery : localSearchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
              />
            </motion.div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                <FiFilter className="w-4 h-4" /> Global Discovery
              </span>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {CATEGORY_LIST.map((cat, idx) => {
                  const Icon = CATEGORY_ICONS[cat] || FiTv;
                  const isActive = activeCategory === cat;
                  return (
                    <motion.button
                      key={cat}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        setActiveCategory(cat);
                        setActiveCountry('All'); 
                      }}
                      className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                        isActive 
                          ? 'bg-primary text-black border-primary shadow-[0_0_40px_rgba(239,68,68,0.4)] scale-105' 
                          : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {cat}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {loading && channels.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
            <FiLoader className="w-12 h-12 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Connecting to Live Registry...</p>
          </div>
        ) : channels.length > 0 ? (
          <div className="space-y-16">
            {/* Conditional Rendering: Sections for All view, Grid for Filtered view */}
            {activeCategory === 'All' && !searchQuery ? (
              <div className="space-y-20">
                <LiveTVSection
                  title="Kenya Live (YouTube)"
                  category="News"
                  channels={KENYA_TV_CHANNELS}
                  onChannelClick={handleChannelClick}
                />
                 {Object.entries(categorizedChannels).map(([cat, catChannels]) => (
                   <LiveTVSection 
                    key={cat}
                    title={cat}
                    category={cat}
                    channels={catChannels}
                    onChannelClick={handleChannelClick}
                    onSeeMore={setActiveCategory}
                   />
                 ))}
              </div>
            ) : (
              <div className="space-y-12">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  <AnimatePresence mode="popLayout">
                    {channels.map((channel) => (
                      <LiveTVCard 
                        key={channel.id} 
                        channel={channel} 
                        onClick={handleChannelClick} 
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="py-20 flex justify-center">
                  {loadingMore ? (
                    <FiLoader className="w-8 h-8 text-primary animate-spin" />
                  ) : hasMore ? (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Scroll for more</p>
                  ) : (
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">End of Registry</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-40 text-center">
            <FiTv className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-500 italic">Registry Empty</h3>
            <p className="text-gray-600 mt-2 font-bold uppercase tracking-widest text-[10px]">
              {searchQuery ? "No matches found" : "Sync cloud channels to begin"}
            </p>
            {!searchQuery && (
              <button 
                onClick={handleStartIngestion}
                className="mt-8 px-8 py-4 bg-primary text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(239,68,68,0.3)]"
              >
                Sync 100k Channels
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTVHub;
