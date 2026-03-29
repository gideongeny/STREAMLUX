import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ALL_TV_CHANNELS, TVChannel } from '../../utils/tvChannelMap';
import { FiTv, FiSearch, FiZap, FiRadio, FiGlobe, FiFilm, FiActivity } from 'react-icons/fi';

const CATEGORY_ICONS: Record<string, any> = {
  All: FiTv,
  News: FiGlobe,
  Entertainment: FiFilm,
  Sports: FiActivity,
  Kids: FiZap,
  Music: FiRadio,
  Lifestyle: FiZap
};

const LiveTVHub: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = useMemo(() => {
    return ALL_TV_CHANNELS.filter(channel => {
      const matchesCategory = activeCategory === 'All' || channel.category === activeCategory;
      const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(ALL_TV_CHANNELS.map(c => c.category)))];

  const handleChannelClick = (channel: TVChannel) => {
    navigate(`/live-tv/${channel.id}`, { state: { channel } });
  };


  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 px-4 md:px-10">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live Broadcasting
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiTv className="w-4 h-4" />
                Back to Dashboard
              </button>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase"
            >
              Live <span className="text-white/20">Streams</span>
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
              placeholder="Search 50+ Premium Channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600"
            />
          </motion.div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat, idx) => {
            const Icon = CATEGORY_ICONS[cat] || FiTv;
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-primary text-black border-primary shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Channels Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredChannels.map((channel, idx) => (
              <motion.div
                layout
                key={channel.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.02 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChannelClick(channel)}
                className="group relative h-48 rounded-[2rem] overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-primary/30 cursor-pointer shadow-2xl transition-all"
              >
                {/* Channel Preview/Logo Placeholder */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-primary/5 transition-colors" />
                
                <div className="relative h-full p-6 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary transition-colors">
                      {channel.category}
                    </span>
                    {channel.type === 'hls' ? (
                      <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">HD HLS</span>
                    ) : (
                      <span className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Live Web</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-black tracking-tighter uppercase line-clamp-2 leading-none">
                      {channel.name}
                    </h3>
                    <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Live Now
                    </span>
                  </div>
                </div>

                {/* Aesthetic Glow */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/10 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredChannels.length === 0 && (
          <div className="py-40 text-center">
            <FiTv className="w-16 h-16 text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-500 italic">No channels found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTVHub;
