import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { musicService, MusicTrack } from '../../services/music';
import { setTrack, setQueue } from '../../store/slice/musicSlice';
import { FiMusic, FiSearch, FiPlay, FiVolume2, FiTrendingUp, FiDisc, FiHome } from 'react-icons/fi';

import { RootState } from '../../store/store';

import { useNavigate } from 'react-router-dom';

const MusicHub: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.music);
  
  const [trending, setTrending] = useState<MusicTrack[]>([]);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    const tracks = await musicService.getTrending();
    setTrending(tracks);
    setIsLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const results = await musicService.search(searchQuery);
    setSearchResults(results);
    setIsLoading(false);
  };

  const playMusic = (track: MusicTrack, list: MusicTrack[]) => {
    dispatch(setTrack(track));
    dispatch(setQueue(list));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-32 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex-grow">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6"
            >
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <FiHome className="w-4 h-4" />
                Back to Dashboard
              </button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-4"
            >
              <FiVolume2 className="animate-bounce" />
              StreamLux Audio Experience
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter italic uppercase leading-none"
            >
              Music <span className="text-white/10">Hub</span>
            </motion.h1>
          </div>


          <motion.form 
            onSubmit={handleSearch}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full md:w-[450px]"
          >
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search Artists, Tracks, or Albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-16 bg-white/5 border border-white/10 rounded-full pl-16 pr-6 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-600 shadow-2xl"
            />
          </motion.form>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait">
          {searchQuery && searchResults.length > 0 ? (
            <motion.div 
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
            >
              {searchResults.map((track, idx) => (
                <TrackCard key={track.id} track={track} onPlay={() => playMusic(track, searchResults)} idx={idx} currentId={currentTrack?.id} isPlaying={isPlaying} />
              ))}
            </motion.div>
          ) : (
            <div key="trending">
              <div className="flex items-center gap-4 mb-8">
                  <FiTrendingUp className="text-primary w-6 h-6" />
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">World Trending</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => <TrackCardSkeleton key={i} />)
                ) : (
                  trending.map((track, idx) => (
                    <TrackCard key={track.id} track={track} onPlay={() => playMusic(track, trending)} idx={idx} currentId={currentTrack?.id} isPlaying={isPlaying} />
                  ))
                )}
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

const TrackCard: React.FC<{ track: MusicTrack; onPlay: () => void; idx: number; currentId?: string; isPlaying: boolean }> = ({ track, onPlay, idx, currentId, isPlaying }) => {
    const isCurrent = currentId === track.id;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -10 }}
            className="group relative"
        >
            <div 
                onClick={onPlay}
                className="aspect-square rounded-[2rem] overflow-hidden relative cursor-pointer shadow-2xl border border-white/5 hover:border-primary/40 transition-all"
            >
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className={`absolute inset-0 bg-black/40 group-hover:bg-primary/20 transition-all flex items-center justify-center ${isCurrent && isPlaying ? 'bg-primary/30' : ''}`}>
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-2xl">
                        {isCurrent && isPlaying ? (
                             <div className="flex gap-1 items-end h-6">
                                <motion.span animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
                                <motion.span animate={{ height: [24, 8, 24] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
                                <motion.span animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-white rounded-full" />
                             </div>
                        ) : (
                            <FiPlay className="w-6 h-6 text-white fill-white ml-1" />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-5 px-2">
                <h3 className="text-sm font-black uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors">
                    {track.title}
                </h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {track.artist}
                </p>
            </div>
        </motion.div>
    );
};

const TrackCardSkeleton = () => (
    <div className="animate-pulse">
        <div className="aspect-square bg-white/5 rounded-[2rem]" />
        <div className="mt-5 flex flex-col gap-2 px-2">
            <div className="h-4 bg-white/5 rounded-full w-3/4" />
            <div className="h-3 bg-white/5 rounded-full w-1/2" />
        </div>
    </div>
);

export default MusicHub;
