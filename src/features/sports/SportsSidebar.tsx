import React from 'react';
import { motion } from 'framer-motion';
import { SportMatch } from './types';
import { useNavigate } from 'react-router-dom';

interface SportsSidebarProps {
  liveMatches: SportMatch[];
  upcomingMatches: SportMatch[];
  currentMatchId?: string;
  onClose?: () => void;
}

const SportsSidebar: React.FC<SportsSidebarProps> = ({ 
  liveMatches, 
  upcomingMatches, 
  currentMatchId,
  onClose 
}) => {
  const navigate = useNavigate();

  const handleMatchClick = (match: SportMatch) => {
    const leagueId = match.leagueId || 'general';
    navigate(`/sports/${leagueId}/${match.id}/watch`, { state: { streamUrl: match.link } });
  };

  const SidebarItem: React.FC<{ match: SportMatch; isLive: boolean }> = ({ match, isLive }) => (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleMatchClick(match)}
      className={`w-full p-4 mb-2 rounded-2xl flex items-center justify-between border transition-all ${
        match.id === currentMatchId 
          ? 'bg-primary/20 border-primary/50 text-white shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]' 
          : 'bg-[#1A1A1A]/40 border-white/5 hover:border-white/10 text-gray-400'
      }`}
    >
      <div className="flex flex-col items-start gap-1 overflow-hidden">
        <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">
          {match.leagueName || 'League'}
        </span>
        <span className="text-xs font-bold truncate w-full text-left">
          {match.isCompetition ? match.homeTeam : `${match.homeTeam} vs ${match.awayTeam}`}
        </span>
        {!isLive && (
          <span className="text-[9px] font-medium text-primary/80">
            {match.kickoffTimeFormatted}
          </span>
        )}
      </div>
      
      {isLive ? (
        <div className="flex flex-col items-end gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
          </span>
          {!match.isCompetition && (
            <span className="text-[10px] font-bold text-white tabular-nums">
                {match.homeScore ?? 0}:{match.awayScore ?? 0}
            </span>
          )}
        </div>
      ) : (
        <div className="text-[8px] font-bold uppercase tracking-tighter text-gray-600">
          {match.minute || 'Upcoming'}
        </div>
      )}
    </motion.button>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0A0A]/80 backdrop-blur-2xl border-l border-white/5 p-5">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-sm font-black text-white tracking-[0.2em] uppercase">Sports Feed</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {/* Live Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-red-500 rounded-full" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Scoreboard</h3>
          </div>
          {liveMatches.length > 0 ? (
            liveMatches.map(match => (
              <SidebarItem key={match.id} match={match} isLive={true} />
            ))
          ) : (
            <p className="text-[10px] text-gray-600 italic px-4">No matches live right now</p>
          )}
        </div>

        {/* Upcoming Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-3 bg-primary rounded-full opacity-50" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming Fixtures</h3>
          </div>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.map(match => (
              <SidebarItem key={match.id} match={match} isLive={false} />
            ))
          ) : (
            <p className="text-[10px] text-gray-600 italic px-4">No upcoming games found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SportsSidebar;
