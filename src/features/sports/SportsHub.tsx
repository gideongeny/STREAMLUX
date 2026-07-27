import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SportMatch } from './types';
import MatchCard from './MatchCard';
import { MdSportsSoccer, MdSportsBasketball, MdSportsBaseball, MdSportsFootball, MdSportsHockey, MdSportsMotorsports, MdSportsKabaddi, MdSportsRugby, MdSportsTennis, MdSportsCricket, MdLocalFireDepartment } from "react-icons/md";
import { SportsFixtureConfig } from '../../shared/constants';
import { getWatchFootyLive, getWatchFootyScheduled, watchfootyToSportMatch } from '../../services/watchfootyAPI';

const toSportMatch = (f: SportsFixtureConfig): SportMatch => watchfootyToSportMatch(f) as SportMatch;

const loadSportsHubData = async (): Promise<{ liveMatches: SportMatch[]; upcomingMatches: SportMatch[] }> => {
  const [live, upcoming] = await Promise.all([getWatchFootyLive(), getWatchFootyScheduled()]);
  return {
    liveMatches: live.map(toSportMatch),
    upcomingMatches: upcoming.map(toSportMatch),
  };
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">
      {title}
    </h2>
  </div>
);

interface SportsHubProps {
  searchQuery?: string;
}

const SportsHub: React.FC<SportsHubProps> = ({ searchQuery = "" }) => {
  const [liveMatches, setLiveMatches] = useState<SportMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<SportMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('All');
  const [liveOnly, setLiveOnly] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Home');


  const categories = [
    { id: 'Home', name: 'Home', icon: <MdLocalFireDepartment size={16} className="text-primary" /> },
    { id: 'Football', name: 'Football', icon: <MdSportsSoccer size={16} /> },
    { id: 'Basketball', name: 'Basketball', icon: <MdSportsBasketball size={16} /> },
    { id: 'Baseball', name: 'Baseball', icon: <MdSportsBaseball size={16} /> },
    { id: 'American Football', name: 'American Football', icon: <MdSportsFootball size={16} /> },
    { id: 'Ice Hockey', name: 'Hockey', icon: <MdSportsHockey size={16} /> },
    { id: 'Motorsport', name: 'Racing', icon: <MdSportsMotorsports size={16} /> },
    { id: 'Fighting', name: 'Fighting', icon: <MdSportsKabaddi size={16} /> },
    { id: 'Rugby', name: 'Rugby', icon: <MdSportsRugby size={16} /> },
    { id: 'Tennis', name: 'Tennis', icon: <MdSportsTennis size={16} /> },
    { id: 'Cricket', name: 'Cricket', icon: <MdSportsCricket size={16} /> },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { liveMatches: live, upcomingMatches: upcoming } = await loadSportsHubData();
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error("Data refresh failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Refresh every 60s for live scoreboard feel
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const groupedMatches = useMemo(() => {
    let all = [...liveMatches, ...upcomingMatches];
    
    // Global deduplication to prevent repeats between live and upcoming arrays
    const seenGlobal = new Set<string>();
    all = all.filter(m => {
        const key = `${m.homeTeam}-${m.awayTeam}`.toLowerCase();
        if (seenGlobal.has(key)) return false;
        seenGlobal.add(key);
        return true;
    });

    // Filter by live only
    if (liveOnly) {
        all = all.filter(m => m.isLive);
    }

    // Filter by active category
    if (activeCategory !== 'Home') {
        all = all.filter(m => {
            const s = (m.sport || m.sportsCategory || "").toLowerCase();
            const cat = activeCategory.toLowerCase();
            return s.includes(cat) || cat.includes(s);
        });
    }

    const groups: Record<string, SportMatch[]> = {};
    
    all.forEach(m => {
      const sport = m.sport || m.sportsCategory || 'Other';
      if (!groups[sport]) groups[sport] = [];
      groups[sport].push(m);
    });

    return groups;
  }, [liveMatches, upcomingMatches, liveOnly, activeCategory]);

  const sortedSports = useMemo(() => {
    return Object.keys(groupedMatches).sort((a, b) => {
        if (a.toLowerCase() === 'football' || a.toLowerCase() === 'soccer') return -1;
        if (b.toLowerCase() === 'football' || b.toLowerCase() === 'soccer') return 1;
        return a.localeCompare(b);
    });
  }, [groupedMatches]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] w-full">
        <div className="w-12 h-12 border-4 border-white/5 border-t-primary rounded-full animate-spin" />
        <p className="mt-4 text-gray-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Syncing Arena Data...</p>
      </div>
    );
  }

  const totalMatchCount = liveMatches.length + upcomingMatches.length;
  const liveMatchCount = liveMatches.length;
  const hasMatches = Object.keys(groupedMatches).length > 0;

  return (
    <div className="max-w-[100vw] overflow-hidden pt-4">
      {/* WatchFooty Style Category Bar */}
      <div className="flex flex-col gap-6 mb-8 px-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                        activeCategory === cat.id 
                        ? 'bg-white text-black font-black' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider">{cat.name}</span>
                </button>
            ))}
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-full hover:bg-white/10 transition-all">
                <span className="text-[11px] font-bold uppercase tracking-wider">More</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live only</span>
                    <button 
                        onClick={() => setLiveOnly(!liveOnly)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${liveOnly ? 'bg-primary' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${liveOnly ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
            </div>

            <button 
                onClick={async () => {
                    setIsLoading(true);
                    try {
                        const { liveMatches: live, upcomingMatches: upcoming } = await loadSportsHubData();
                        setLiveMatches(live);
                        setUpcomingMatches(upcoming);
                    } catch (error) {
                        console.error("Manual refresh failed:", error);
                    } finally {
                        setIsLoading(false);
                    }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
            >
                <svg className={`w-3 h-3 text-primary ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Refresh</span>
            </button>
        </div>
      </div>

      {/* Dynamic Sections by Sport */}
      {hasMatches ? sortedSports.map((sport) => {
        const matches = groupedMatches[sport].filter(m => {
          const q = searchQuery.toLowerCase();
          if (q && !m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q)) return false;
          return true;
        });

        if (matches.length === 0) return null;

        const liveCount = matches.filter(m => m.isLive).length;

        return (
          <section key={sport} className="mb-12 px-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-xl">
                        {categories.find(c => c.id.toLowerCase().includes(sport.toLowerCase()))?.icon || '⚽'}
                    </span>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
                        Popular {sport}
                    </h2>
                    {liveCount > 0 && (
                        <span className="text-[10px] font-bold text-gray-500 lowercase">
                            Live ({liveCount})
                        </span>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => {
                            const el = document.getElementById(`scroll-${sport}`);
                            if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button 
                        onClick={() => {
                            const el = document.getElementById(`scroll-${sport}`);
                            if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            <div id={`scroll-${sport}`} className="flex gap-4 md:gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar px-2 -mx-2 snap-x">
              <AnimatePresence>
                {matches.map((match) => (
                  <div key={match.id} className="min-w-[260px] md:min-w-[300px] shrink-0 snap-start">
                    <MatchCard match={match} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        );
      }) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 mx-6 bg-black/40 backdrop-blur-[40px] rounded-cinema-xl border border-white/[0.04] shadow-premium-lg relative overflow-hidden">
          {/* Ambient center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 shadow-cinema-glow rounded-full flex items-center justify-center mb-8">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <p className="text-white font-black uppercase tracking-[0.4em] text-lg mb-4 sl-text-gradient">Arena is Silent</p>
            <p className="text-[#888] text-[11px] font-bold uppercase tracking-[0.2em] max-w-[320px] text-center leading-loose">
                {liveOnly && totalMatchCount > 0 && liveMatchCount === 0
                  ? "No live fixtures right now. Turn off Live Only to see upcoming matches."
                  : "We couldn't find any live or upcoming fixtures. Try refreshing or check back during major match hours."}
            </p>
            {liveOnly && totalMatchCount > liveMatchCount && (
              <button
                onClick={() => setLiveOnly(false)}
                className="mt-6 px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-bold uppercase text-[10px] tracking-[0.25em] rounded-full border border-white/15 transition-all"
              >
                Show Upcoming
              </button>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-10 px-10 py-4 bg-gradient-to-r from-primary to-accent-ember text-white font-bold uppercase text-[11px] tracking-[0.3em] rounded-full shadow-neon-primary hover:scale-105 hover:shadow-glow-primary-strong transition-all duration-500"
            >
              Hard Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsHub;
