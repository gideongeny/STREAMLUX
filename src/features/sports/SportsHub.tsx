import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sportsService } from './api';
import { SportMatch } from './types';
import MatchCard from './MatchCard';

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase italic">
      {title}
    </h2>
  </div>
);

const SportsHub: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<SportMatch[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<SportMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [live, upcoming] = await Promise.all([
        sportsService.getLiveMatches(),
        sportsService.getUpcomingMatches()
      ]);
      
      if (live.success) setLiveMatches(live.data);
      if (upcoming.success) setUpcomingMatches(upcoming.data);
      setIsLoading(false);
    };

    fetchData();
    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const sports = useMemo(() => {
      const all = [...liveMatches, ...upcomingMatches];
      return ['All', ...Array.from(new Set(all.map(m => m.sport || 'Sports')))];
  }, [liveMatches, upcomingMatches]);

  const TWO_HOURS = 2 * 60 * 60 * 1000;

  // Filter live matches: hide if kicked off more than 2 hours ago (match should be over)
  const filteredLive = liveMatches.filter(m => {
    if (selectedSport !== 'All' && m.sport !== selectedSport) return false;
    const q = searchQuery.toLowerCase();
    if (q && !m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q)) return false;
    if (m.kickoffTimeFormatted) {
      const kickoff = new Date(m.kickoffTimeFormatted).getTime();
      if (!isNaN(kickoff) && Date.now() - kickoff > TWO_HOURS) return false;
    }
    return true;
  });

  // Filter upcoming: hide anything that already started more than 2 hours ago
  const filteredUpcoming = upcomingMatches.filter(m => {
    if (selectedSport !== 'All' && m.sport !== selectedSport) return false;
    const q = searchQuery.toLowerCase();
    if (q && !m.homeTeam.toLowerCase().includes(q) && !m.awayTeam.toLowerCase().includes(q)) return false;
    if (m.kickoffTimeFormatted) {
      const kickoff = new Date(m.kickoffTimeFormatted).getTime();
      if (!isNaN(kickoff) && Date.now() - kickoff > TWO_HOURS) return false;
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
        <div className="relative w-full md:w-[400px]">
          <input
            type="text"
            placeholder="Search teams or leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A]/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:border-primary/50 outline-none transition-all placeholder:text-gray-600"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          {sports.map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-6 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all whitespace-nowrap ${
                selectedSport === sport 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white/5 text-gray-500 hover:bg-white/10'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {/* Live Matches */}
      {filteredLive.length > 0 && (
        <section className="mb-16">
          <SectionTitle title="Live Scoreboard" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredLive.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Upcoming Matches */}
      <section>
        <SectionTitle title="Upcoming Fixtures" />
        {filteredUpcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredUpcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <p className="text-gray-500 font-bold uppercase tracking-widest">No upcoming games match your filters</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SportsHub;
