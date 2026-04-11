import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useInView } from 'react-intersection-observer';
import { musicService, MusicTrack } from '../../services/music';
import { setTrack, setQueue } from '../../store/slice/musicSlice';
import { FiSearch, FiPlay, FiTrendingUp, FiHome, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { RootState } from '../../store/store';
import { useNavigate } from 'react-router-dom';

const GENRES = [
  "Hip Hop Classics", "Global Pop", "R&B Hits", "Afrobeats", "Latin Reggaeton",
  "Electronic Dance", "K-Pop Top Hits", "Alternative Rock", "Chill Lo-Fi", "Country Anthems",
  "Acoustic Covers", "Classic Rock", "Jazz Vibes", "Classical Focus", "Bollywood Top 50",
  "Workout Motivation", "Indie Rock", "90s Nostalgia", "Reggae Classics", "Heavy Metal"
];

const GenreRow: React.FC<{ genre: string; isPlaying: boolean; currentId?: string; onPlay: (track: MusicTrack, list: MusicTrack[]) => void }> = ({ genre, isPlaying, currentId, onPlay }) => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "400px 0px" });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inView) {
      // Add 'Playlist' keyword to ensure optimal results from the youtube search fallback gateway
      musicService.search(`${genre} Hits playlist 2024`).then(res => setTracks(res.slice(0, 15)));
    }
  }, [inView, genre]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section ref={ref} className="mb-16">
      <div className="flex items-center justify-between mb-8 px-2">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-gray-200">{genre}</h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <FiChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {tracks.length === 0 ? (
        <div className="flex gap-6 overflow-hidden pb-8 px-2">
           {Array(5).fill(0).map((_, i) => <TrackCardSkeleton key={i} />)}
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar pb-8 sm:px-2 scroll-smooth">
          {tracks.map((track, idx) => (
            <div key={track.id} className="min-w-[180px] md:min-w-[240px]">
              <TrackCard track={track} onPlay={() => onPlay(track, tracks)} idx={idx} currentId={currentId} isPlaying={isPlaying} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

interface MusicHubProps {
  isEmbed?: boolean;
  searchQuery?: string;
}

const MusicHub: React.FC<MusicHubProps> = ({ isEmbed, searchQuery = "" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentTrack, isPlaying } = useSelector((state: RootState) => state.music);
  
  const [trending, setTrending] = useState<MusicTrack[]>([]);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const trendingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    const tracks = await musicService.getTrending();
    setTrending(tracks);
    setIsLoading(false);
  };

  // Handle contextual search from global State
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const triggerSearch = async () => {
      setIsLoading(true);
      const results = await musicService.search(searchQuery);
      setSearchResults(results);
      setIsLoading(false);
    };
    triggerSearch();
  }, [searchQuery]);

  const playMusic = (track: MusicTrack, list: MusicTrack[]) => {
    dispatch(setTrack(track));
    dispatch(setQueue(list));
  };

  const scrollTrending = (direction: 'left' | 'right') => {
    if (trendingRef.current) {
        const { scrollLeft, clientWidth } = trendingRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        trendingRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className={`${isEmbed ? '' : 'min-h-screen pt-24'} bg-[#050505] text-white pb-48 px-4 md:px-10 overflow-hidden`}>
      <div className="max-w-[1600px] mx-auto">
        
        {!isEmbed && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-20">
            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <button 
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <FiHome className="w-4 h-4 group-hover:scale-120 transition-transform" />
                  Back to Dashboard
                </button>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-6"
              >
                <div className="flex gap-1">
                  <span className="w-1 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1 h-5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                High Fidelity Audio
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase leading-[0.85] select-none"
              >
                MUSIC <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 opacity-80">UNIVERSE</span>
              </motion.h1>
            </div>

            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.3 }}
               className="relative lg:w-[500px]"
            >
              <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <FiSearch className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6 group-focus-within:text-primary transition-colors z-10" />
                  <input 
                      type="text"
                      placeholder="Search 100M+ Songs, Artists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-20 bg-white/5 border border-white/10 rounded-[2rem] pl-20 pr-8 text-lg font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 backdrop-blur-3xl relative z-10"
                  />
              </form>
            </motion.div>
          </div>
        )}

        {isEmbed && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
             <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                <div className="flex gap-0.5">
                  <span className="w-0.5 h-2 bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-0.5 h-3 bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                </div>
                Music Explorer
              </div>
          </div>
        )}

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {searchQuery && searchResults.length > 0 ? (
            <motion.section 
                key="search"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8"
            >
              {searchResults.map((track, idx) => (
                <TrackCard key={track.id} track={track} onPlay={() => playMusic(track, searchResults)} idx={idx} currentId={currentTrack?.id} isPlaying={isPlaying} />
              ))}
            </motion.section>
          ) : (
            <motion.div 
               key="dashboard"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="space-y-16"
            >
              {/* Trending Carousel */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-10 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <FiTrendingUp className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Global Trending</h2>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => scrollTrending('left')} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <FiChevronLeft size={24} />
                        </button>
                        <button onClick={() => scrollTrending('right')} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
                            <FiChevronRight size={24} />
                        </button>
                    </div>
                </div>
                
                <div 
                    ref={trendingRef}
                    className="flex gap-8 overflow-x-auto no-scrollbar pb-10 sm:px-2 scroll-smooth"
                >
                    {isLoading ? (
                        Array(8).fill(0).map((_, i) => <TrackCardSkeleton key={i} />)
                    ) : (
                        trending.map((track, idx) => (
                            <div key={track.id} className="min-w-[220px] md:min-w-[280px]">
                                <TrackCard track={track} onPlay={() => playMusic(track, trending)} idx={idx} currentId={currentTrack?.id} isPlaying={isPlaying} />
                            </div>
                        ))
                    )}
                </div>
              </section>

              {/* Lazy-Loaded Genre Carousels */}
              {GENRES.map(genre => (
                  <GenreRow key={genre} genre={genre} isPlaying={isPlaying} currentId={currentTrack?.id} onPlay={playMusic} />
              ))}

            </motion.div>
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (idx % 5) * 0.1 }}
            className="group relative"
        >
            <div 
                onClick={onPlay}
                className="aspect-square rounded-[2.5rem] overflow-hidden relative cursor-pointer shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-white/5 hover:border-primary/40 transition-all duration-500 bg-white/5"
            >
                <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
                <div className={`absolute inset-0 bg-black/40 group-hover:bg-primary/20 transition-all duration-500 flex items-center justify-center ${isCurrent && isPlaying ? 'bg-primary/30' : ''}`}>
                    <div className={`w-16 h-16 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-500 transform ${isCurrent && isPlaying ? 'scale-110 opacity-100' : 'translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                        {isCurrent && isPlaying ? (
                             <div className="flex gap-1 items-end h-6">
                                <motion.span animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-white rounded-full" />
                                <motion.span animate={{ height: [24, 8, 24] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-white rounded-full" />
                                <motion.span animate={{ height: [12, 20, 12] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1.5 bg-white rounded-full" />
                             </div>
                        ) : (
                            <FiPlay className="w-7 h-7 text-white fill-white ml-1.5" />
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 px-3">
                <h3 className="text-base font-black uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors italic">
                    {track.title}
                </h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1 flex-1">
                        {track.artist}
                    </p>
                    {track.source === 'saavn' && (
                        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-400 font-black tracking-[2px]">HQ</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const TrackCardSkeleton = () => (
    <div className="min-w-[180px] md:min-w-[240px] animate-pulse w-full">
        <div className="aspect-square bg-white/5 rounded-[2.5rem]" />
        <div className="mt-6 flex flex-col gap-3 px-3">
            <div className="h-5 bg-white/5 rounded-full w-3/4" />
            <div className="h-3 bg-white/5 rounded-full w-1/2" />
        </div>
    </div>
);

export default MusicHub;

